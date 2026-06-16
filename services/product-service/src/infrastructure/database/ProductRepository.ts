import sqlite3 from 'sqlite3';
import { Product, Review, IProductRepository } from '../../domain/entities/Product.js';
import path from 'url';
import pathLib from 'path';

const __dirname = pathLib.dirname(path.fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || pathLib.join(__dirname, '../../../../products.sqlite');

export class SQLiteProductRepository implements IProductRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to Product database:', err.message);
      } else {
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    this.db.serialize(() => {
      // Products Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          sku TEXT UNIQUE NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          originalPrice REAL,
          image TEXT,
          thumbnails TEXT,
          rating REAL,
          ratingCount INTEGER,
          badge TEXT,
          isAzureResource INTEGER,
          specs TEXT,
          isOutOfStock INTEGER
        )
      `);

      // Reviews Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          productId TEXT NOT NULL,
          author TEXT NOT NULL,
          rating INTEGER NOT NULL,
          date TEXT NOT NULL,
          title TEXT,
          body TEXT,
          verified INTEGER,
          FOREIGN KEY (productId) REFERENCES products (id)
        )
      `);

      // Check if seed is needed
      this.db.get('SELECT COUNT(*) as count FROM products', (err, row: any) => {
        if (!err && row && row.count === 0) {
          this.seedProducts();
        }
      });
    });
  }

  private seedProducts() {
    const productsToSeed: Product[] = [
      {
        id: 'azure-vm',
        name: 'Azure Virtual Machine (v2 Compute)',
        category: 'Compute & VM',
        sku: 'AZ-COMP-VMV2',
        description: 'On-demand, highly scalable, general-purpose Linux or Windows computing. Perfect for dev-test, staging, microservices, or production workloads. Features automated patching, backup controls, and NVMe-backed SSD storage.',
        price: 74,
        originalPrice: 89,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUIrT68Vdcc6J13lbQ02tL1jGBve83YknLAgQIeA7SiG0k_WB7YmU5_69zvk2GZxPQD2lIAlLYRNdNwuHzH5PWg5B6GBrTzzztSnP3-GBZ4PkUa6RfySEDvICjGlatEKtBNCGkurGcmMBeWHtv6f0B1_X501NW6UT5ja9bdZ6AvaEHheEV-x5RCWRxrQi4lhBvVv6lugpHmSPUN-ID28Zxm3s0zU0ZK5UFzda-bwP4D03V3GVm3-qUvkj8Hm6X8tY_z4yELzkEzlpY',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAUIrT68Vdcc6J13lbQ02tL1jGBve83YknLAgQIeA7SiG0k_WB7YmU5_69zvk2GZxPQD2lIAlLYRNdNwuHzH5PWg5B6GBrTzzztSnP3-GBZ4PkUa6RfySEDvICjGlatEKtBNCGkurGcmMBeWHtv6f0B1_X501NW6UT5ja9bdZ6AvaEHheEV-x5RCWRxrQi4lhBvVv6lugpHmSPUN-ID28Zxm3s0zU0ZK5UFzda-bwP4D03V3GVm3-qUvkj8Hm6X8tY_z4yELzkEzlpY'],
        rating: 4.9,
        ratingCount: 382,
        badge: 'NEW RESOURCE',
        isAzureResource: true,
        specs: {
          'SLA Guaranteed': '99.99%',
          'Maximum vCPUs': '96 Cores',
          'Hyper-threading': 'Intel® Xeon® Platinum Supported',
          'Operating System': 'Ubuntu / Debian / CentOS / Windows Server',
          'Virtualization': 'Nested Virtualization enabled',
          'Storage Access': 'Azure Ultra Disk SSD compliant'
        }
      },
      {
        id: 'azure-cosmos',
        name: 'Azure Cosmos DB Database Instance',
        category: 'Data & Storage',
        sku: 'AZ-DB-COSMOS',
        description: 'Globally distributed, multi-model SQL/NoSQL database service with unlimited, horizontal scaling. Guarantees single-digit millisecond latency at the 99th percentile, multi-region database replication, and strict consistency tiers.',
        price: 120,
        originalPrice: 150,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPta9eDkrJTAFzUTGrFv4gGO5mXEt538x1BSYOAWE__pTIBJCXbAsrhvnJWw2I6jjgkfm4CV0vwwWqZgvDXt7_lrwftdThuV1LyACsZbCKiPvwk3oRlvvXYfmGsFZfQX09p74NhLcOtjwg3gltmMBxxLcNS5FPWv2ubJcBJwnPjAEdhucrbU1ctVvD8sfSTciksWyZXA1AzK5QN6PedJGmUSRE3YC9MyykIeX7mm9lNEZkkgcoARAy8k9kjUQO8i7Doz9lEkNdYhus',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAPta9eDkrJTAFzUTGrFv4gGO5mXEt538x1BSYOAWE__pTIBJCXbAsrhvnJWw2I6jjgkfm4CV0vwwWqZgvDXt7_lrwftdThuV1LyACsZbCKiPvwk3oRlvvXYfmGsFZfQX09p74NhLcOtjwg3gltmMBxxLcNS5FPWv2ubJcBJwnPjAEdhucrbU1ctVvD8sfSTciksWyZXA1AzK5QN6PedJGmUSRE3YC9MyykIeX7mm9lNEZkkgcoARAy8k9kjUQO8i7Doz9lEkNdYhus'],
        rating: 4.8,
        ratingCount: 194,
        badge: 'SCALABLE NoSQL',
        isAzureResource: true,
        specs: {
          'SLA Guaranteed': '99.999% Read & Write',
          'API Compatibility': 'Core SQL (NoSQL) / MongoDB / Cassandra / Gremlin',
          'Encryption': 'Double-encryption at-rest (Customer-Managed Keys)',
          'Backup': 'Continuous backup with point-in-time restore',
          'Replication': 'Active-active multi-region writes'
        }
      },
      {
        id: 'azure-cognitive',
        name: 'Azure AI Translation & Search Cluster',
        category: 'Compute & VM',
        sku: 'AZ-AI-COGSRCH',
        description: 'Fully-managed enterprise search and custom Translation AI endpoints. Securely parses, indexes, and translates structured or unstructured documents across billions of records. Built-in integration with Azure OpenAI LLM vectors.',
        price: 185,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgrK_O_2o5Sy7XAxkSM0jWqxvNrXTFSMj33qi71p_Gd78h-vjToMXE1Y4OhqANPUeW4ObN9ms6phN2NpYUhu3gVUceimzENRzNP-Zp1NmuvfGhOTtKw5xP8FwFBIcHvPJQNO26fLZUPByUb2u3bzjecmXUqfajtYAU7gabGgSGJFkOE6HRAkwrRKhe98WLu36FAUCAt2cOICInPF0cbO0xwnEidz0oGsBdyNBLeuIqOl4WuX0hlXksv9hn9Ly_fP5xVJ28pX5kFdND',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAgrK_O_2o5Sy7XAxkSM0jWqxvNrXTFSMj33qi71p_Gd78h-vjToMXE1Y4OhqANPUeW4ObN9ms6phN2NpYUhu3gVUceimzENRzNP-Zp1NmuvfGhOTtKw5xP8FwFBIcHvPJQNO26fLZUPByUb2u3bzjecmXUqfajtYAU7gabGgSGJFkOE6HRAkwrRKhe98WLu36FAUCAt2cOICInPF0cbO0xwnEidz0oGsBdyNBLeuIqOl4WuX0hlXksv9hn9Ly_fP5xVJ28pX5kFdND'],
        rating: 4.7,
        ratingCount: 104,
        badge: 'AI BOOSTED',
        isAzureResource: true,
        specs: {
          'SLA Guaranteed': '99.9%',
          'Vector Search': 'Supported natively (HNSW algorithm)',
          'Languages Covered': '140+ fully supported languages',
          'Compliance': 'HIPAA, SOC 2 Type II, ISO 27001 compliant',
          'Throughput': 'Configurable Replica Units (RUs)'
        }
      },
      {
        id: 'sonictech-headphones',
        name: 'Aura Pro Wireless ANC Headphones',
        category: 'IoT DevKit',
        sku: 'ST-AUDIO-HEADPHONES',
        description: 'Experience pure audio bliss with the Aura Pro. Featuring next-generation Active Noise Cancellation, custom 40mm drivers for rich bass and crisp highs, and a battery life that lasts up to 40 hours on a single charge. Designed for all-day comfort with memory foam ear cushions and lightweight aluminum chassis.',
        price: 299,
        originalPrice: 349,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB31RQe4gfsjWjOP__KWv7eSi7Fem6e8Ewt_kCc3SDN5uBUjBeqdFZS4_iCIHDZ9PQ_4v1dbqp4_r80CxaS1110KvmnYnQJWVFREpx_PbD-0tMc__lCLG1STiOtR6R6hNfx2oDNvq-MvKIXXvKjRSUOWrWffQ-9G-4U2REsAwICXXoue1OcRVFzLs2tru6oNcldn9Y24t87c-dCjfdFbN5DaAFf3bRGgtbEFYFNYJpQm83z1tDZzECt5g9O4FDIBjguAiWJZ4x7CO9z',
        thumbnails: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAVDTZNE7uBRwS224fWiEpm-HzzzgGKnj9pvHld5Af670OfawFHeiEyDK7NhAksxABySYvWn0zxqKneCu9goM1XM3OuMhju9O5MEYWbl0ij350EIBm0Zm5I7DPKx57_g1Raq5B3ZzUQknYHmaRiFGlQuhtP4UmgJn1ZDhhA6lrJVY_1yEjL1L8g9jlp2AnT1Zg-0ZqI6bS1InL85ghjib0J5AEAx9oxiwW1hG6-PVqrG4uCV8CO9czLydHJZ69i7aO6y-IhXU6bVek5',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAFhJn-RbUutlNPr9VlZT8Sbb9qzuaGGER9aBI39H4FxDjy3FE8aAmVmrC1l6Z9VAaImZiUnXn_uUzf3vuBBUpBnyDVZcM-FGisFFvpx7DJxd02S3VaoGjZFReSlYbsaxqPA2E3fO6RfzBM_sNidrvziHsz7uApyqlDjU21PVRddfqzZ01VTlr7goSpN2-dQwE0JYHBXa7FrER4xEFYy1Y8de16bPd37oBomRi_K_LvrWP2sxfrYPFbTwBInV1SfeNwPK1PSefdW2P_',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA1441DiCCCg9sOFfFqpGGxUA80H6XL-rZB1-dlMVc1AJnI9CTOa1y_k_b-cAt6KQWa2e6s6LBJm0dHRbco-PSWehMrjcPu0CLF2gn1VGPBgK1KfYeH2QWGLCCRpwiSsisV90g1fh4gwTdjG1j_yP_QlozMP4Y_ax23aAz62ybAGNLFyTmpVf7uK3L1ZG9Uzde5mmxLsNjSV4Roz9xlf_nJcWtitP65HVzMgepXO14HVzwIR-IQ4prEqEK8izlMG3gc9Ah-_wsk85dK',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBP-OsRGniHN_Hi7aMCh13hSuWMUyagPVdb3_4MKooBAX2FjA7U8QOlV1vN65Pc8Emaoq1PzKANb5xwTYKfijg9SoB4f9XYH6cwrsn_8Vm6Z3eW9JqjKtVHv9zKcRUwwhsWBNBV-pXfc9Sbn8uSS6gsd34IkSq-VnWW78E9ohQNQv9bpqE6FV6ETodCqqLUjuur5607iX06kedzSx46pDLag2thH84ao-JOoVU43FQo1UGmTDXyAI4HlXhKoYG0XdR0xBfieaS0mmej'
        ],
        rating: 4.8,
        ratingCount: 1284,
        badge: 'BESTSELLER',
        isAzureResource: false,
        specs: {
          'Bluetooth Version': '5.3 (Low Energy)',
          'Battery Life': 'Up to 40 Hours (ANC On) / 55 Hours (ANC Off)',
          'Driver Size': 'Dynamic 40mm Dome Driver',
          'Charging Protocol': 'USB-C Fast Charging (10 mins equals 5 hrs)',
          'Audio Codecs': 'LDAC, AAC, SBC, Qualcomm® aptX™ HD',
          'Weight': '254 Grams lightweight'
        }
      },
      {
        id: 'chronos-smartwatch',
        name: 'Chronos Smartwatch',
        category: 'IoT DevKit',
        sku: 'CH-IOT-WATCH',
        description: 'A pristine watch with architectural casing. Ideal as an Azure IoT hub monitor, syncing telemetry, CPU spikes, and Azure service notifications directly to your wrist. Packed with wellness sensors, active metrics, and ambient styling.',
        price: 299,
        originalPrice: 350,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-RFxQgiY74gn3W-4Wr7lbzAsyu8Ky4h_-RTEb4u9k96pyck4_HroJknc4_4Oe2kwf8Kc2tcFhN4wC4aVCJEFXHIr4_WvDBdnkxQxeBQVfVc_Oh7-y3_s-lRMf4ioDRX6qBPUBAzRN7_wsAN_rBYQFZtQJcb8_kYwvKv6gjaIcPSlSJtm1hH3S_tqwf1MB3t5K-5-SEl05CMtsK-HwNHMpCzk7DMm0U44UFClIOVOWDU2D28pf8UwErgIAyIcgG18T0kU00s0B_WV5',
        thumbnails: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA-RFxQgiY74gn3W-4Wr7lbzAsyu8Ky4h_-RTEb4u9k96pyck4_HroJknc4_4Oe2kwf8Kc2tcFhN4wC4aVCJEFXHIr4_WvDBdnkxQxeBQVfVc_Oh7-y3_s-lRMf4ioDRX6qBPUBAzRN7_wsAN_rBYQFZtQJcb8_kYwvKv6gjaIcPSlSJtm1hH3S_tqwf1MB3t5K-5-SEl05CMtsK-HwNHMpCzk7DMm0U44UFClIOVOWDU2D28pf8UwErgIAyIcgG18T0kU00s0B_WV5',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxrdl3gLPQ-FefVyQHw_DHoctQThEVeWMla287oqjhpQy50RnVT8nODMrian77_E_eFycU_L5NrgsXimgPRyHIresoEXUn1SEcaK4W2pJOFgCofXs6WIiFzit8ahrsvbW50o_nVAUbCkjodAVUvHGkkwsa2yuuMm3wviA2qExE4a4TpXjU7gpV96lFgNJBflKYBzqNb4FQKrO4anQ8J12QAG9m6FB_c1jsbh3UxcD_KMsfvzWXVGeGnL24FRYpvose4xHW5uamQaAP'
        ],
        rating: 4.6,
        ratingCount: 512,
        badge: 'NEW',
        isAzureResource: false,
        specs: {
          'Active Display': 'LTPO Always-On AMOLED, 1000 nits peak',
          'Azure Integration': 'Webhooks, Service Bus & IoT Grid notification native apps',
          'Casing Material': 'Surgical-Grade Titanium',
          'Battery Rating': 'Up to 4 Days standard use / 18 days battery-saver',
          'Water Rating': '50 meters (5ATM) Swim-proof'
        }
      },
      {
        id: 'urban-backpack',
        name: 'Urban Technical Daypack',
        category: 'Apparel & Gear',
        sku: 'UB-GEAR-BACKPACK',
        description: 'Designed for commuting tech developers. Fitted with a protective floating 16" laptop sleeve, internal power-bank routing, magnetic FIDLOCK sliders, and water-repellent Cordura shell. Spacious, durable, and highly utilitarian.',
        price: 145,
        originalPrice: 160,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeANlhuFQuJK_y1C7x55zKPIL1w5k7Co_nQ3wFrA8uR6i8D9uMh5fDjSu42QmS-ZP-VM-ZPJNyVWiyDnn80yPem_7RUhyPJ09_wnElXd5VG4f9WPx3OTekfVaKKdGMvJR4Oe-DO3CM0kzmTquXBcn2pq8HFhLgKx3dcxXFrP_R2Q1-amhuEwV-dJS7IoVb3U-u_Tl3OdNY1-K5WIsxZVdWkD2jYCTrxXqxl2pmakh04BINySJzPkC2DKCe5KfeI2lqxWSPGZjeEoSA',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCeANlhuFQuJK_y1C7x55zKPIL1w5k7Co_nQ3wFrA8uR6i8D9uMh5fDjSu42QmS-ZP-VM-ZPJNyVWiyDnn80yPem_7RUhyPJ09_wnElXd5VG4f9WPx3OTekfVaKKdGMvJR4Oe-DO3CM0kzmTquXBcn2pq8HFhLgKx3dcxXFrP_R2Q1-amhuEwV-dJS7IoVb3U-u_Tl3OdNY1-K5WIsxZVdWkD2jYCTrxXqxl2pmakh04BINySJzPkC2DKCe5KfeI2lqxWSPGZjeEoSA'],
        rating: 4.8,
        ratingCount: 310,
        isAzureResource: false,
        specs: {
          'Volume Capacity': '24 Liters expandible to 28L',
          'Main Fabric': '1050D Cordura® Water-Repelling Ballistic Nylon',
          'Laptop Safe Slot': 'Suspended floating sleeve, impact protected, soft lining',
          'Hardware Accessories': 'FIDLOCK® sliding magnetic buckles',
          'Weight empty': '0.92 Kilograms'
        }
      },
      {
        id: 'aero-sneakers',
        name: 'Aero Runner Plus',
        category: 'Apparel & Gear',
        sku: 'AR-SPORT-RUNNER',
        description: 'Striking running shoes featuring optimized cloud-pods under the soles to absorb heavy impacts. Crafted with an ultra-breathable engineered knit and a custom rubber compound grid for superior energy-recovery.',
        price: 180,
        originalPrice: 200,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0NYqyc4FG2pr2plXlv4rnM6k5hy96DVuh-Yc1AOcrG9C8hmQrclE45QyHNk4ATJOXTtoyZ36B5w3lLtAHEh_aYWSWmmGBsvCFHSMd5aV4SeFrnMCs_eG0mATbt72wXlCJwZkL3f8kPHxjqD13NBUSmU2ijpON1CKNkYHmMWvZAap_R5wB0-4vuW4JUf_fsHDpbAKgbAqVgbUWOszIWWwayiU3XI1Zn8a15kuML3ibEtKcqV8C0LAqQvh88alm1sHSiP_GByi1eR7z',
        thumbnails: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB0NYqyc4FG2pr2plXlv4rnM6k5hy96DVuh-Yc1AOcrG9C8hmQrclE45QyHNk4ATJOXTtoyZ36B5w3lLtAHEh_aYWSWmmGBsvCFHSMd5aV4SeFrnMCs_eG0mATbt72wXlCJwZkL3f8kPHxjqD13NBUSmU2ijpON1CKNkYHmMWvZAap_R5wB0-4vuW4JUf_fsHDpbAKgbAqVgbUWOszIWWwayiU3XI1Zn8a15kuML3ibEtKcqV8C0LAqQvh88alm1sHSiP_GByi1eR7z',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBGSLRM3dAGX8LL41Y_gIihDs7L3Dqep1qnCvhqqSMngVXybh1Ic9RgQN0dCxKygk7YjKpQvzTAHuowJLaVAWUftRIsadFD1MuL0bsFXtpGWMslPHsNLosZ-eiaoQdMsazyFQGALjqB3ArJMMU6QiJ5ATScj039TOshXvqyCShE_Lpn99bDnAQYZaCTCK6KVAKSkmv6FHXiI-n_VaEojCfBgeb8uZ41P8K4bC282qTgfcACfahBRDe7xzXcsJMzsE_QWbIoKgh94oKQ'
        ],
        rating: 4.7,
        ratingCount: 165,
        isAzureResource: false,
        specs: {
          'Outsole Style': 'Carbon-infused Energy Loop rubber grid',
          'Midsole Tech': 'Reactive Gas-infused cloud pods',
          'Heel-to-toe offset': '8 Millimeters',
          'Total Weight': '228 Grams (Men size 9)'
        }
      },
      {
        id: 'artisan-mug',
        name: 'Artisan Speckled Coffee Mug',
        category: 'Smart Workspace',
        sku: 'AM-HOME-COFFEEMUG',
        description: 'Perfect companion for early coding standups or midnight bug hunts. Crafted from custom stoneware with a hand-applied grey speckled glaze, a broad secure handles grip, and a thermal insulation oak-wood coaster base.',
        price: 34,
        originalPrice: 40,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ber7qcF4UKVVkhVRyLcy7JQ8be8UnsCexIl9l4YLgBO6hrUBDq2T9DKZbyx5Qb13BSDKin16bf3-s8qegrBY4CAjKgxLuUV31GEtowxi2F_4o-SRQ9SgGYHzoOkEOtr2HlM7-S7Qkvt5wbp-HAuROFFe4_bTF2YNm7l-O6WEJbYL7X0DcVFvXLmmKX1n8mrCk7h-Egb4DPjXBYZ6TZxBEZYzM6NYFr1KIKAWAHMmZacjdPD9zjtFu9uyOvbDrz47igudRTlpu6ej',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ber7qcF4UKVVkhVRyLcy7JQ8be8UnsCexIl9l4YLgBO6hrUBDq2T9DKZbyx5Qb13BSDKin16bf3-s8qegrBY4CAjKgxLuUV31GEtowxi2F_4o-SRQ9SgGYHzoOkEOtr2HlM7-S7Qkvt5wbp-HAuROFFe4_bTF2YNm7l-O6WEJbYL7X0DcVFvXLmmKX1n8mrCk7h-Egb4DPjXBYZ6TZxBEZYzM6NYFr1KIKAWAHMmZacjdPD9zjtFu9uyOvbDrz47igudRTlpu6ej'],
        rating: 4.9,
        ratingCount: 421,
        badge: '15% OFF',
        isAzureResource: false,
        specs: {
          'Capacity Capacity': '14 Fluid Ounces / 415ml',
          'Construction Material': 'Heavy-duty stoneware clay',
          'Outer Coating': 'Reactive speckled non-toxic matte glaze',
          'Thermal Coaster': 'Included circular ash/oak hardwood base',
          'Heat Stability': 'Microwave & commercial dishwasher safe (mug only)'
        }
      },
      {
        id: 'nova-keyboard',
        name: 'Nova Mechanical Keyboard',
        category: 'Smart Workspace',
        sku: 'NK-TECH-KEYBOARD',
        description: 'A tactile, high-grade mechanical keyboard featuring crisp sand-blasted aluminum framing, pre-lubricated tactile switches, white PBT keycaps with thermal dye-sublimation, and responsive sound dampening layers.',
        price: 149,
        originalPrice: 169,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB46NshppPVrJ2Al4UlcsGhJ9aQqoWJ7N_zL0uN490Q4bNY-dkdpcBtfU8mvlRJsFJ06T7g4tPwF_9Xb-bPWtDw24STSJrWDlzX5YhrTsJ6ZnMjajUNlfZtEn6oPTlM7Gq5sdwqE4r8sR8LDxbObRtpgTujvKTn0k0il6-fpPhdZXXB-T-JDc53obvpJ85utFHTTSBtThjLcNFKiHf8rM8BBBDUviG_FFmdK3uNakQrFoCnhVhFJ5WMsXU0lye9VCQjeva8oW0MNDKC',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB46NshppPVrJ2Al4UlcsGhJ9aQqoWJ7N_zL0uN490Q4bNY-dkdpcBtfU8mvlRJsFJ06T7g4tPwF_9Xb-bPWtDw24STSJrWDlzX5YhrTsJ6ZnMjajUNlfZtEn6oPTlM7Gq5sdwqE4r8sR8LDxbObRtpgTujvKTn0k0il6-fpPhdZXXB-T-JDc53obvpJ85utFHTTSBtThjLcNFKiHf8rM8BBBDUviG_FFmdK3uNakQrFoCnhVhFJ5WMsXU0lye9VCQjeva8oW0MNDKC'],
        rating: 4.8,
        ratingCount: 148,
        isAzureResource: false,
        specs: {
          'Layout structure': 'Tenkeyless 75% Compact layout, hot-swappable socket',
          'Tactile Switch': 'Pre-lubricated Tactile Brown switches (50g actuation)',
          'Keycap Material': 'Thick double-shot PBT keycaps',
          'Connectivity Mode': 'USB-C / 2.4GHz Wireless / Bluetooth 5.1 polling at 1000Hz',
          'Weight': '1.14 Kilograms solid'
        }
      },
      {
        id: 'essential-tee',
        name: 'Azure Dev Essential Cotton Tee',
        category: 'Apparel & Gear',
        sku: 'AT-DEV-TSHIRT',
        description: 'Heavyweight organic cotton t-shirt with a structured relaxed fit, ribbed crew neck collar, and flat-locked robust seams. Highly durable, extremely soft, and perfect for active developer operations.',
        price: 35,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCulOuDqXKbttTu9Q_EMfEJWxqfIhF9lh-eEC2VDJEhP8EvfpeD7hjkZxyV3vbz0Yj5VhCXJRcPLL1GE_grJyzZPTxE9PcPoPvYzuUUsxWICkM7OjlcwzqsGp9xaefap3204U9xSQtQk2vBQxjaL0A4KjzZxwiFqr8NUMHYCa-oJqeWsvlWmbvtGZqqA781_4JstuFyJ2tb1qsc9ln2bmIrGWx6puEvuJE1lEPxucrYgVtsYLIKN8pz0O41eP2Q6sq9Hy1OAiZ18G6h',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCulOuDqXKbttTu9Q_EMfEJWxqfIhF9lh-eEC2VDJEhP8EvfpeD7hjkZxyV3vbz0Yj5VhCXJRcPLL1GE_grJyzZPTxE9PcPoPvYzuUUsxWICkM7OjlcwzqsGp9xaefap3204U9xSQtQk2vBQxjaL0A4KjzZxwiFqr8NUMHYCa-oJqeWsvlWmbvtGZqqA781_4JstuFyJ2tb1qsc9ln2bmIrGWx6puEvuJE1lEPxucrYgVtsYLIKN8pz0O41eP2Q6sq9Hy1OAiZ18G6h'],
        rating: 4.5,
        ratingCount: 88,
        isAzureResource: false,
        specs: {
          'Fabric Material': '100% GOTS Certified Organic Cotton',
          'Weight fabric': '240 GSM heavy knit',
          'Thread quality': '30s combed compact yarn',
          'Collar specs': '1x1 persistent ribbed collar structure',
          'Country of Origin': 'Made ethically with local workers'
        }
      },
      {
        id: 'pods-pro',
        name: 'Aura Pods Pro Charging Case',
        category: 'IoT DevKit',
        sku: 'AP-AUDIO-EARBUDS',
        description: 'Sleek white wireless earbuds with true high-fidelity active audio transducers. Lightweight, ultra-compact, with a modern protective snap-locking wireless charging case that syncs battery stats with your terminal.',
        price: 149,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEfM1GMYJKd0w7MOsYD0pByu_s4t-ItwYECWmz1PkYJLG8rqCQE6nT2DqH_A1N0NDHsx_aPl2TY2nV2X-7MvqR-6xPNPF_SGYRvz1Cfz0Sts0Cg1Prc9dkuJ2VccqMHR-TSaiYiDGcyWftPWb4tMmWT-w5WqXosrk_txZuPzPvgsYsen6-diRAjUCwzIUVXH1gWrfMb83tFP-3nWrYpcttpYR2oha6eDG54Z2svICmRg6HsgeSl-_dVwU3v0iDVOggERu2BMvCRqNk',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDEfM1GMYJKd0w7MOsYD0pByu_s4t-ItwYECWmz1PkYJLG8rqCQE6nT2DqH_A1N0NDHsx_aPl2TY2nV2X-7MvqR-6xPNPF_SGYRvz1Cfz0Sts0Cg1Prc9dkuJ2VccqMHR-TSaiYiDGcyWftPWb4tMmWT-w5WqXosrk_txZuPzPvgsYsen6-diRAjUCwzIUVXH1gWrfMb83tFP-3nWrYpcttpYR2oha6eDG54Z2svICmRg6HsgeSl-_dVwU3v0iDVOggERu2BMvCRqNk'],
        rating: 4.7,
        ratingCount: 412,
        isAzureResource: false,
        specs: {
          'Dynamic Transducer': '6mm dynamic driver with high-compliance membrane',
          'Transceiver Chip': 'SonicTech Low Latency Bluetooth 5.4',
          'Total Autonomy': 'Up to 30 Hours with charging dock',
          'Dust Water protection': 'IPX4 perspiration resistant'
        }
      },
      {
        id: 'alloy-stand',
        name: 'Premium Alloy Headphone Stand',
        category: 'Smart Workspace',
        sku: 'ST-DECOR-STAND',
        description: 'Clean, solid sand-blasted aluminum headphone rack designed to coordinate with high-end designer workspace desks. Weighted base with silicone anti-slip buffers prevents listing.',
        price: 45,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ztS18F3yA7VrVaa0eiXaifKXgs3beltadMmkpzB3kJJx8XpXivPy78pY8b3vEJjMsFVyFleSrbibm8z_agds3pnlEJbxPRxxc9ILXaQiOgy-dshn0LhV9RPnskFmmqaoqi5FXGIs0OgIxaoTbYACfJS0NUeOlODdKe8AB9YjB0TTH59VH4RudvUkQnh8MChuhtiJZayePpH9DQoS2AzVnS7sOhhDuTag-X0sHVRSIa_-_IcbL-1muHU9VJxKKsFtT0Y6pJ_CSSLY',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD9ztS18F3yA7VrVaa0eiXaifKXgs3beltadMmkpzB3kJJx8XpXivPy78pY8b3vEJjMsFVyFleSrbibm8z_agds3pnlEJbxPRxxc9ILXaQiOgy-dshn0LhV9RPnskFmmqaoqi5FXGIs0OgIxaoTbYACfJS0NUeOlODdKe8AB9YjB0TTH59VH4RudvUkQnh8MChuhtiJZayePpH9DQoS2AzVnS7sOhhDuTag-X0sHVRSIa_-_IcbL-1muHU9VJxKKsFtT0Y6pJ_CSSLY'],
        rating: 4.9,
        ratingCount: 33,
        isAzureResource: false,
        specs: {
          'Chassis Alloys': 'Aircraft-grade 6000 series aluminum',
          'Finishing coating': 'Anodized sand-blasted coating',
          'Stabilizer base': 'Silicone pads, countersunk weighted core'
        }
      },
      {
        id: 'audiophile-cable',
        name: 'Audiophile Braided AUX Cable',
        category: 'IoT DevKit',
        sku: 'AM-CABLE-AUX',
        description: 'Ultra-low impedance premium braided auxiliary cable fitted with gold-plated connectors, offering lossless transmission for reference-quality analog sound systems.',
        price: 24,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBamAKjJYQ1earDcqFcggT9Gv-sIrUt3G4b1gHkdSPDAeUuP4jl7A5dDcbbnBkAXtJx4QZNlnXAau4CsDLYuxK15laPbaQwXweTirDH158hnmPIta0eTqu_eTThrWQ5XfG-ajtV5S3s2xu1vMKaZWgm0hrV6gXZ9c2KlL08El5DVu-0PIEf9ll8n4BluQ11JZR8gnMUQ2sjKNslFGJKeXdIgf41lFxPsHLikVbwLa3J-NtsGbDtZjS-Z5w60_-brO-zuVOObWhPOUDE',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBamAKjJYQ1earDcqFcggT9Gv-sIrUt3G4b1gHkdSPDAeUuP4jl7A5dDcbbnBkAXtJx4QZNlnXAau4CsDLYuxK15laPbaQwXweTirDH158hnmPIta0eTqu_eTThrWQ5XfG-ajtV5S3s2xu1vMKaZWgm0hrV6gXZ9c2KlL08El5DVu-0PIEf9ll8n4BluQ11JZR8gnMUQ2sjKNslFGJKeXdIgf41lFxPsHLikVbwLa3J-NtsGbDtZjS-Z5w60_-brO-zuVOObWhPOUDE'],
        rating: 4.8,
        ratingCount: 52,
        isAzureResource: false,
        specs: {
          'Connector Style': 'Standard 3.5mm Stereo jack male-to-male',
          'Shielding layer': 'Dual-shielded oxygen-free copper cores',
          'Outer Braiding': 'High-density military braided wrap'
        }
      },
      {
        id: 'cooling-gel-pads',
        name: 'Memory Gel Headset Cushions',
        category: 'IoT DevKit',
        sku: 'AP-ACC-CUSHIONS',
        description: 'Upgraded ear pads for over-ear headphones filled with high-density pressure-relieving memory foam with an active thermal absorption cooling gel layer.',
        price: 29,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZqwqBl_7ORYETPGRgC9PlvdaVHoOHmB1bL1YfzPYx3XHNUjZNTPObE7GGQ7hk_2BL_rW5rZx20OZhg0NblKIKQ5ewf2L0ubiqxOp5SBHXLsppqXVC2U_TDZ93nKo83s6npomD5A-_mG4f8meAk34XQMYNxNtdPx7VVyCqJLGhumFt8OFvyva8fpp5L3hgkc1lb_l4nKQz-iHjqc4UwiGWfB3uXARn581UrJ1u5i5PIObM0NpEx-BosIkW6yPAcqCZYulDDbbCU9u4',
        thumbnails: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDZqwqBl_7ORYETPGRgC9PlvdaVHoOHmB1bL1YfzPYx3XHNUjZNTPObE7GGQ7hk_2BL_rW5rZx20OZhg0NblKIKQ5ewf2L0ubiqxOp5SBHXLsppqXVC2U_TDZ93nKo83s6npomD5A-_mG4f8meAk34XQMYNxNtdPx7VVyCqJLGhumFt8OFvyva8fpp5L3hgkc1lb_l4nKQz-iHjqc4UwiGWfB3uXARn581UrJ1u5i5PIObM0NpEx-BosIkW6yPAcqCZYulDDbbCU9u4'],
        rating: 4.8,
        ratingCount: 224,
        isAzureResource: false,
        specs: {
          'Core Cushioning': 'Gel-infused slow resilience memory foam',
          'Lining Structure': 'Highly breathable Ice-silk skin composite',
          'Base Frame': 'Serrated snap-fitting rings compliant'
        }
      }
    ];

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO products (
        id, name, category, sku, description, price, originalPrice, image, thumbnails, rating, ratingCount, badge, isAzureResource, specs, isOutOfStock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of productsToSeed) {
      stmt.run(
        p.id,
        p.name,
        p.category,
        p.sku,
        p.description,
        p.price,
        p.originalPrice || null,
        p.image,
        JSON.stringify(p.thumbnails),
        p.rating,
        p.ratingCount,
        p.badge || null,
        p.isAzureResource ? 1 : 0,
        JSON.stringify(p.specs),
        p.isOutOfStock ? 1 : 0
      );
    }
    stmt.finalize();
  }

  public findAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM products', [], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category as any,
          sku: row.sku,
          description: row.description,
          price: row.price,
          originalPrice: row.originalPrice,
          image: row.image,
          thumbnails: JSON.parse(row.thumbnails),
          rating: row.rating,
          ratingCount: row.ratingCount,
          badge: row.badge,
          isAzureResource: row.isAzureResource === 1,
          specs: JSON.parse(row.specs),
          isOutOfStock: row.isOutOfStock === 1
        })));
      });
    });
  }

  public findById(id: string): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          id: row.id,
          name: row.name,
          category: row.category as any,
          sku: row.sku,
          description: row.description,
          price: row.price,
          originalPrice: row.originalPrice,
          image: row.image,
          thumbnails: JSON.parse(row.thumbnails),
          rating: row.rating,
          ratingCount: row.ratingCount,
          badge: row.badge,
          isAzureResource: row.isAzureResource === 1,
          specs: JSON.parse(row.specs),
          isOutOfStock: row.isOutOfStock === 1
        });
      });
    });
  }

  public findReviewsByProductId(productId: string): Promise<Review[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM reviews WHERE productId = ?', [productId], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows.map(row => ({
          id: row.id,
          productId: row.productId,
          author: row.author,
          rating: row.rating,
          date: row.date,
          title: row.title,
          body: row.body,
          verified: row.verified === 1
        })));
      });
    });
  }

  public createReview(review: Review): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO reviews (id, productId, author, rating, date, title, body, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [review.id, review.productId, review.author, review.rating, review.date, review.title, review.body, review.verified ? 1 : 0],
        (err) => {
          if (err) return reject(err);
          resolve(review);
        }
      );
    });
  }
}
