/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem } from '../types';

export function generateArmTemplate(items: CartItem[]): string {
  const resources: any[] = [];
  const parameters: any = {
    location: {
      type: 'string',
      defaultValue: '[resourceGroup().location]',
      metadata: {
        description: 'Primary location for all resources.'
      }
    }
  };

  items.forEach((item) => {
    const config = item.customConfig;
    const region = config?.region || 'eastus';
    const cleanId = item.product.id.replace(/-/g, '');

    if (item.product.id === 'azure-vm') {
      const vcpus = config?.vCPUs || 4;
      const ram = config?.ramGB || 16;
      const vmSize = vcpus <= 2 ? 'Standard_B2s' : vcpus <= 4 ? 'Standard_D4s_v5' : 'Standard_D8s_v5';

      // Networking dependencies
      resources.push({
        type: 'Microsoft.Network/publicIPAddresses',
        apiVersion: '2023-09-01',
        name: `${cleanId}PublicIP`,
        location: `[parameters('location')]`,
        properties: {
          publicIPAllocationMethod: 'Dynamic'
        }
      });

      resources.push({
        type: 'Microsoft.Network/virtualNetworks',
        apiVersion: '2023-09-01',
        name: `${cleanId}VNet`,
        location: `[parameters('location')]`,
        properties: {
          addressSpace: {
            addressPrefixes: ['10.0.0.0/16']
          },
          subnets: [
            {
              name: 'default',
              properties: {
                addressPrefix: '10.0.0.0/24'
              }
            }
          ]
        }
      });

      resources.push({
        type: 'Microsoft.Network/networkInterfaces',
        apiVersion: '2023-09-01',
        name: `${cleanId}Nic`,
        location: `[parameters('location')]`,
        dependsOn: [
          `[resourceId('Microsoft.Network/publicIPAddresses', '${cleanId}PublicIP')]`,
          `[resourceId('Microsoft.Network/virtualNetworks', '${cleanId}VNet')]`
        ],
        properties: {
          ipConfigurations: [
            {
              name: 'ipconfig1',
              properties: {
                privateIPAllocationMethod: 'Dynamic',
                subnet: {
                  id: `[resourceId('Microsoft.Network/virtualNetworks/subnets', '${cleanId}VNet', 'default')]`
                },
                publicIPAddress: {
                  id: `[resourceId('Microsoft.Network/publicIPAddresses', '${cleanId}PublicIP')]`
                }
              }
            }
          ]
        }
      });

      // Actual VM
      resources.push({
        type: 'Microsoft.Compute/virtualMachines',
        apiVersion: '2023-09-01',
        name: `CloudCommerceVM`,
        location: `[parameters('location')]`,
        dependsOn: [
          `[resourceId('Microsoft.Network/networkInterfaces', '${cleanId}Nic')]`
        ],
        properties: {
          hardwareProfile: {
            vmSize: vmSize
          },
          osProfile: {
            computerName: 'azurecommerce-node',
            adminUsername: 'azureuser',
            linuxConfiguration: {
              disablePasswordAuthentication: true,
              ssh: {
                publicKeys: [
                  {
                    path: '/home/azureuser/.ssh/authorized_keys',
                    keyData: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...'
                  }
                ]
              }
            }
          },
          storageProfile: {
            imageReference: {
              publisher: 'Canonical',
              offer: '0001-com-ubuntu-server-jammy',
              sku: '22_04-lts-gen2',
              version: 'latest'
            },
            osDisk: {
              createOption: 'FromImage',
              managedDisk: {
                storageAccountType: config?.tier === 'Premium' ? 'Premium_LRS' : 'Standard_LRS'
              },
              diskSizeGB: config?.storageGB || 128
            }
          },
          networkProfile: {
            networkInterfaces: [
              {
                id: `[resourceId('Microsoft.Network/networkInterfaces', '${cleanId}Nic')]`
              }
            ]
          }
        }
      });
    }

    if (item.product.id === 'azure-cosmos') {
      resources.push({
        type: 'Microsoft.DocumentDB/databaseAccounts',
        apiVersion: '2023-09-15',
        name: `cosmosaccount${Math.floor(1000 + Math.random() * 9000)}`,
        location: `[parameters('location')]`,
        kind: 'GlobalDocumentDB',
        properties: {
          consistencyPolicy: {
            defaultConsistencyLevel: 'Session'
          },
          locations: [
            {
              locationName: `[parameters('location')]`,
              failoverPriority: 0,
              isZoneRedundant: config?.tier === 'Premium'
            }
          ],
          databaseAccountOfferType: 'Standard',
          enableAutomaticFailover: true
        }
      });
    }

    if (item.product.id === 'azure-cognitive') {
      resources.push({
        type: 'Microsoft.Search/searchServices',
        apiVersion: '2023-11-01',
        name: `cognitivesearchservice`,
        location: `[parameters('location')]`,
        sku: {
          name: config?.tier === 'Premium' ? 'standard' : config?.tier === 'Standard' ? 'basic' : 'free'
        },
        properties: {
          replicaCount: 1,
          partitionCount: 1,
          hostingMode: 'default'
        }
      });
    }
  });

  // Default fallback if no infrastructure was purchased
  if (resources.length === 0) {
    resources.push({
      type: 'Microsoft.Storage/storageAccounts',
      apiVersion: '2023-01-01',
      name: `merchantstorestorage`,
      location: `[parameters('location')]`,
      sku: {
        name: 'Standard_LRS'
      },
      kind: 'StorageV2',
      properties: {
        accessTier: 'Hot'
      }
    });
  }

  const armTemplate = {
    $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    parameters: parameters,
    variables: {},
    resources: resources,
    outputs: {
      deploymentStatus: {
        type: 'string',
        value: 'Success: CloudCommerce provisioned resources successfully.'
      }
    }
  };

  return JSON.stringify(armTemplate, null, 2);
}

export function generateBicepCode(items: CartItem[]): string {
  let bicep = `// CloudCommerce Automated Azure Provisioning File\n`;
  bicep += `param location string = resourceGroup().location\n\n`;

  let hasVM = false;
  let hasCosmos = false;
  let hasCognitive = false;

  items.forEach((item) => {
    const config = item.customConfig;
    const vcpus = config?.vCPUs || 4;
    const vmSize = vcpus <= 2 ? 'Standard_B2s' : vcpus <= 4 ? 'Standard_D4s_v5' : 'Standard_D8s_v5';

    if (item.product.id === 'azure-vm') {
      hasVM = true;
      bicep += `// Virtual Machine Provisioning Suite\n`;
      bicep += `resource publicIP 'Microsoft.Network/publicIPAddresses@2023-09-01' = {\n`;
      bicep += `  name: 'vmPublicIP'\n`;
      bicep += `  location: location\n`;
      bicep += `  properties: {\n`;
      bicep += `    publicIPAllocationMethod: 'Dynamic'\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;

      bicep += `resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {\n`;
      bicep += `  name: 'vmVNet'\n`;
      bicep += `  location: location\n`;
      bicep += `  properties: {\n`;
      bicep += `    addressSpace: {\n`;
      bicep += `      addressPrefixes: ['10.0.0.0/16']\n`;
      bicep += `    }\n`;
      bicep += `    subnets: [\n`;
      bicep += `      {\n`;
      bicep += `        name: 'default'\n`;
      bicep += `        properties: {\n`;
      bicep += `          addressPrefix: '10.0.0.0/24'\n`;
      bicep += `        }\n`;
      bicep += `      }\n`;
      bicep += `    ]\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;

      bicep += `resource nic 'Microsoft.Network/networkInterfaces@2023-09-01' = {\n`;
      bicep += `  name: 'vmNic'\n`;
      bicep += `  location: location\n`;
      bicep += `  properties: {\n`;
      bicep += `    ipConfigurations: [\n`;
      bicep += `      {\n`;
      bicep += `        name: 'ipconfig1'\n`;
      bicep += `        properties: {\n`;
      bicep += `          privateIPAllocationMethod: 'Dynamic'\n`;
      bicep += `          subnet: {\n`;
      bicep += `            id: vnet.properties.subnets[0].id\n`;
      bicep += `          }\n`;
      bicep += `          publicIPAddress: {\n`;
      bicep += `            id: publicIP.id\n`;
      bicep += `          }\n`;
      bicep += `        }\n`;
      bicep += `      }\n`;
      bicep += `    ]\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;

      bicep += `resource vm 'Microsoft.Compute/virtualMachines@2023-09-01' = {\n`;
      bicep += `  name: 'CloudCommerceVM'\n`;
      bicep += `  location: location\n`;
      bicep += `  properties: {\n`;
      bicep += `    hardwareProfile: {\n`;
      bicep += `      vmSize: '${vmSize}'\n`;
      bicep += `    }\n`;
      bicep += `    osProfile: {\n`;
      bicep += `      computerName: 'azurecommerce-node'\n`;
      bicep += `      adminUsername: 'azureuser'\n`;
      bicep += `    }\n`;
      bicep += `    storageProfile: {\n`;
      bicep += `      imageReference: {\n`;
      bicep += `        publisher: 'Canonical'\n`;
      bicep += `        offer: '0001-com-ubuntu-server-jammy'\n`;
      bicep += `        sku: '22_04-lts-gen2'\n`;
      bicep += `        version: 'latest'\n`;
      bicep += `      }\n`;
      bicep += `      osDisk: {\n`;
      bicep += `        createOption: 'FromImage'\n`;
      bicep += `        diskSizeGB: ${config?.storageGB || 128}\n`;
      bicep += `      }\n`;
      bicep += `    }\n`;
      bicep += `    networkProfile: {\n`;
      bicep += `      networkInterfaces: [\n`;
      bicep += `        {\n`;
      bicep += `          id: nic.id\n`;
      bicep += `        }\n`;
      bicep += `      ]\n`;
      bicep += `    }\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;
    }

    if (item.product.id === 'azure-cosmos') {
      hasCosmos = true;
      const dbName = `cosmos${Math.floor(1000 + Math.random() * 9000)}`;
      bicep += `// Azure Cosmos DB Scale System\n`;
      bicep += `resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-09-15' = {\n`;
      bicep += `  name: '${dbName}'\n`;
      bicep += `  location: location\n`;
      bicep += `  properties: {\n`;
      bicep += `    databaseAccountOfferType: 'Standard'\n`;
      bicep += `    locations: [\n`;
      bicep += `      {\n`;
      bicep += `        locationName: location\n`;
      bicep += `        failoverPriority: 0\n`;
      bicep += `        isZoneRedundant: ${config?.tier === 'Premium'}\n`;
      bicep += `      }\n`;
      bicep += `    ]\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;
    }

    if (item.product.id === 'azure-cognitive') {
      hasCognitive = true;
      const searchSku = config?.tier === 'Premium' ? 'standard' : config?.tier === 'Standard' ? 'basic' : 'free';
      bicep += `// AI Search Cognitive Cluster\n`;
      bicep += `resource cognitiveSearch 'Microsoft.Search/searchServices@2023-11-01' = {\n`;
      bicep += `  name: 'cognitiveSearchService'\n`;
      bicep += `  location: location\n`;
      bicep += `  sku: {\n`;
      bicep += `    name: '${searchSku}'\n`;
      bicep += `  }\n`;
      bicep += `}\n\n`;
    }
  });

  if (!hasVM && !hasCosmos && !hasCognitive) {
    bicep += `// Default Storefront Hot-Tier Storage Account\n`;
    bicep += `resource storageAcc 'Microsoft.Storage/storageAccounts@2023-01-01' = {\n`;
    bicep += `  name: 'merchantstorestorage'\n`;
    bicep += `  location: location\n`;
    bicep += `  sku: {\n`;
    bicep += `    name: 'Standard_LRS'\n`;
    bicep += `  }\n`;
    bicep += `  kind: 'StorageV2'\n`;
    bicep += `}\n`;
  }

  return bicep;
}

export function generateCliScript(items: CartItem[]): string {
  let cli = `# /bin/bash\n# CloudCommerce Azure Provisioning script\n\n`;
  cli += `# 1. Create a custom Azure Resource Group\n`;
  cli += `az group create --name CloudCommerceGRP --location eastus\n\n`;

  let hasAny = false;

  items.forEach((item) => {
    const config = item.customConfig;
    const vcpus = config?.vCPUs || 4;
    const vmSize = vcpus <= 2 ? 'Standard_B2s' : vcpus <= 4 ? 'Standard_D4s_v5' : 'Standard_D8s_v5';

    if (item.product.id === 'azure-vm') {
      hasAny = true;
      cli += `# 2. Provision customized Ubuntu Virtual Machine Instance\n`;
      cli += `az vm create \\\n`;
      cli += `  --resource-group CloudCommerceGRP \\\n`;
      cli += `  --name CloudCommerceVM \\\n`;
      cli += `  --image Canonical:0001-com-ubuntu-server-jammy:22_04-lts-gen2:latest \\\n`;
      cli += `  --size ${vmSize} \\\n`;
      cli += `  --admin-username azureuser \\\n`;
      cli += `  --generate-ssh-keys \\\n`;
      cli += `  --os-disk-size-gb ${config?.storageGB || 128} \\\n`;
      cli += `  --public-ip-sku Standard\n\n`;
    }

    if (item.product.id === 'azure-cosmos') {
      hasAny = true;
      const dbName = `cosmosdb${Math.floor(1000 + Math.random() * 9000)}`;
      cli += `# 3. Provision Azure Cosmos DB Database Instance\n`;
      cli += `az cosmosdb create \\\n`;
      cli += `  --name ${dbName} \\\n`;
      cli += `  --resource-group CloudCommerceGRP \\\n`;
      cli += `  --locations regionName="East US" failoverPriority=0 isZoneRedundant=${config?.tier === 'Premium' ? 'true' : 'false'} \\\n`;
      cli += `  --default-consistency-level Session\n\n`;
    }

    if (item.product.id === 'azure-cognitive') {
      hasAny = true;
      const searchSku = config?.tier === 'Premium' ? 'standard' : config?.tier === 'Standard' ? 'basic' : 'free';
      cli += `# 4. Provision AI Cognitive Search Cluster\n`;
      cli += `az search service create \\\n`;
      cli += `  --name cognitivesearchservice \\\n`;
      cli += `  --resource-group CloudCommerceGRP \\\n`;
      cli += `  --sku ${searchSku} \\\n`;
      cli += `  --partition-count 1 \\\n`;
      cli += `  --replica-count 1\n\n`;
    }
  });

  if (!hasAny) {
    cli += `# 2. Provision static Storefront Storage account\n`;
    cli += `az storage account create \\\n`;
    cli += `  --name merchantstorestorage \\\n`;
    cli += `  --resource-group CloudCommerceGRP \\\n`;
    cli += `  --location eastus \\\n`;
    cli += `  --sku Standard_LRS \\\n`;
    cli += `  --kind StorageV2\n`;
  }

  return cli;
}
