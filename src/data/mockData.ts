import { Manufacturer, Quote, Conversation, Notification, ResponseTemplate, PerformanceMetrics } from '../types';
import { factoryDatabase } from './factoryDatabase';

// Export the comprehensive factory database as mockManufacturers
export const mockManufacturers: Manufacturer[] = factoryDatabase;

export const mockQuotes: Quote[] = [
  {
    id: 'q1',
    manufacturerId: 'factory-001',
    projectId: 'p1',
    status: 'received',
    pricePerUnit: 45.50,
    totalPrice: 45500,
    leadTimeDays: 21,
    moq: 100,
    validUntil: new Date('2024-03-15'),
    files: [
      {
        id: 'f1',
        name: 'quote_precision_mfg.pdf',
        url: '/files/quote_precision_mfg.pdf',
        type: 'application/pdf',
        size: 245760,
        uploadedAt: new Date('2024-02-01')
      }
    ],
    notes: 'Includes tooling costs. Volume discounts available for orders over 500 units.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    extractedData: {
      pricePerUnit: 45.50,
      leadTime: 21,
      moq: 100,
      certifications: ['ISO 9001', 'AS9100'],
      paymentTerms: 'Net 30',
      shippingTerms: 'FOB Origin',
      warranty: '1 Year'
    },
    score: 92
  },
  {
    id: 'q2',
    manufacturerId: 'factory-003',
    projectId: 'p1',
    status: 'received',
    pricePerUnit: 38.75,
    totalPrice: 38750,
    leadTimeDays: 28,
    moq: 1000,
    validUntil: new Date('2024-03-20'),
    files: [
      {
        id: 'f2',
        name: 'sv_plastics_quote.pdf',
        url: '/files/sv_plastics_quote.pdf',
        type: 'application/pdf',
        size: 189440,
        uploadedAt: new Date('2024-02-03')
      }
    ],
    notes: 'Clean room assembly included. FDA compliance documentation provided.',
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03'),
    extractedData: {
      pricePerUnit: 38.75,
      leadTime: 28,
      moq: 1000,
      certifications: ['ISO 13485', 'FDA Registered'],
      paymentTerms: 'Net 45',
      shippingTerms: 'FOB Destination',
      warranty: '2 Years'
    },
    score: 88
  },
  {
    id: 'q3',
    manufacturerId: 'factory-004',
    projectId: 'p1',
    status: 'pending',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    files: []
  },
  {
    id: 'q4',
    manufacturerId: 'factory-008',
    projectId: 'p1',
    status: 'received',
    pricePerUnit: 125.00,
    totalPrice: 125000,
    leadTimeDays: 18,
    moq: 10,
    validUntil: new Date('2024-03-25'),
    files: [
      {
        id: 'f4',
        name: 'rocky_mountain_quote.pdf',
        url: '/files/rocky_mountain_quote.pdf',
        type: 'application/pdf',
        size: 312450,
        uploadedAt: new Date('2024-02-10')
      }
    ],
    notes: 'Premium precision machining with exotic materials. Includes full inspection report.',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    extractedData: {
      pricePerUnit: 125.00,
      leadTime: 18,
      moq: 10,
      certifications: ['AS9100', 'ISO 13485', 'ITAR'],
      paymentTerms: 'Net 30',
      shippingTerms: 'FOB Origin',
      warranty: '2 Years'
    },
    score: 95
  },
  {
    id: 'q5',
    manufacturerId: 'factory-012',
    projectId: 'p2',
    status: 'received',
    pricePerUnit: 850.00,
    totalPrice: 85000,
    leadTimeDays: 35,
    moq: 100,
    validUntil: new Date('2024-04-01'),
    files: [
      {
        id: 'f5',
        name: 'solar_components_quote.pdf',
        url: '/files/solar_components_quote.pdf',
        type: 'application/pdf',
        size: 198760,
        uploadedAt: new Date('2024-02-12')
      }
    ],
    notes: 'Solar panel assembly with 25-year warranty. Includes installation support.',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12'),
    extractedData: {
      pricePerUnit: 850.00,
      leadTime: 35,
      moq: 100,
      certifications: ['IEC 61215', 'UL 1703', 'ISO 9001'],
      paymentTerms: 'Net 45',
      shippingTerms: 'FOB Destination',
      warranty: '25 Years'
    },
    score: 89
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    manufacturerId: 'factory-001',
    userId: '1',
    type: 'email',
    subject: 'Quote Request - IoT Sensor Hub',
    status: 'active',
    priority: 'high',
    lastMessageAt: new Date('2024-02-10T14:30:00'),
    tags: ['quote', 'urgent'],
    messages: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: '1',
        senderType: 'user',
        content: 'Hi, I\'m interested in getting a quote for manufacturing IoT sensor hubs. The specifications are attached.',
        type: 'text',
        timestamp: new Date('2024-02-08T10:00:00'),
        read: true
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: 'mfg1',
        senderType: 'manufacturer',
        content: 'Thank you for your inquiry. We\'ve reviewed your specifications and can definitely help. Our quote is attached with detailed breakdown.',
        type: 'text',
        timestamp: new Date('2024-02-10T14:30:00'),
        read: false,
        files: [
          {
            id: 'mf1',
            name: 'detailed_quote.pdf',
            url: '/files/detailed_quote.pdf',
            type: 'application/pdf',
            size: 156789
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    manufacturerId: 'factory-003',
    userId: '1',
    type: 'direct_message',
    subject: 'Material Specifications Clarification',
    status: 'active',
    priority: 'medium',
    lastMessageAt: new Date('2024-02-09T16:45:00'),
    tags: ['materials', 'clarification'],
    messages: [
      {
        id: 'm3',
        conversationId: 'c2',
        senderId: 'mfg3',
        senderType: 'manufacturer',
        content: 'Could you clarify the material requirements for the housing? We have several options that might work better.',
        type: 'text',
        timestamp: new Date('2024-02-09T16:45:00'),
        read: false
      }
    ]
  },
  {
    id: 'c3',
    manufacturerId: 'factory-008',
    userId: '1',
    type: 'portal',
    subject: 'Precision Machining Capabilities Discussion',
    status: 'active',
    priority: 'medium',
    lastMessageAt: new Date('2024-02-11T11:20:00'),
    tags: ['capabilities', 'precision'],
    messages: [
      {
        id: 'm4',
        conversationId: 'c3',
        senderId: 'mfg8',
        senderType: 'manufacturer',
        content: 'We specialize in exotic materials like titanium and Inconel. Our 5-axis capabilities can achieve the tolerances you need.',
        type: 'text',
        timestamp: new Date('2024-02-11T11:20:00'),
        read: false
      }
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    type: 'quote_update',
    title: 'New Quote Received',
    message: 'Precision Manufacturing Co. has submitted a quote for your IoT Sensor Hub project.',
    read: false,
    actionUrl: '/quotes/q1',
    createdAt: new Date('2024-02-10T14:30:00'),
    priority: 'high'
  },
  {
    id: 'n2',
    userId: '1',
    type: 'message',
    title: 'New Message',
    message: 'Silicon Valley Plastics sent you a message about material specifications.',
    read: false,
    actionUrl: '/conversations/c2',
    createdAt: new Date('2024-02-09T16:45:00'),
    priority: 'medium'
  },
  {
    id: 'n3',
    userId: '1',
    type: 'status_change',
    title: 'Quote Status Updated',
    message: 'Your quote request to Midwest Electronics Assembly is now being reviewed.',
    read: true,
    actionUrl: '/quotes/q3',
    createdAt: new Date('2024-02-05T11:20:00'),
    priority: 'low'
  },
  {
    id: 'n4',
    userId: '1',
    type: 'quote_update',
    title: 'Premium Quote Available',
    message: 'Rocky Mountain Machining has provided a quote for precision titanium components.',
    read: false,
    actionUrl: '/quotes/q4',
    createdAt: new Date('2024-02-10T16:15:00'),
    priority: 'high'
  },
  {
    id: 'n5',
    userId: '1',
    type: 'message',
    title: 'Capabilities Discussion',
    message: 'Rocky Mountain Machining wants to discuss their exotic materials capabilities.',
    read: false,
    actionUrl: '/conversations/c3',
    createdAt: new Date('2024-02-11T11:20:00'),
    priority: 'medium'
  }
];

export const mockResponseTemplates: ResponseTemplate[] = [
  {
    id: 't1',
    name: 'Initial Quote Request',
    subject: 'Quote Request - {{projectName}}',
    content: 'Hello {{manufacturerName}},\n\nI hope this message finds you well. I\'m reaching out to request a quote for manufacturing {{projectName}}.\n\nProject Details:\n- Product: {{productDescription}}\n- Material: {{material}}\n- Quantity: {{quantity}} units annually\n- Target Price: ${{targetPrice}} per unit\n- Lead Time: {{leadTime}} days\n\nPlease find the detailed specifications attached. I\'d appreciate if you could provide:\n1. Unit pricing for different quantities\n2. Lead times\n3. Tooling costs (if applicable)\n4. Payment terms\n\nThank you for your time and consideration.\n\nBest regards,\n{{userName}}',
    category: 'quote_request',
    variables: ['manufacturerName', 'projectName', 'productDescription', 'material', 'quantity', 'targetPrice', 'leadTime', 'userName'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    usageCount: 15
  },
  {
    id: 't2',
    name: 'Follow-up on Quote',
    subject: 'Following up on Quote Request - {{projectName}}',
    content: 'Hello {{manufacturerName}},\n\nI wanted to follow up on the quote request I sent on {{requestDate}} for {{projectName}}.\n\nCould you please provide an update on the status? If you need any additional information or clarification, please let me know.\n\nLooking forward to hearing from you.\n\nBest regards,\n{{userName}}',
    category: 'follow_up',
    variables: ['manufacturerName', 'projectName', 'requestDate', 'userName'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    usageCount: 8
  },
  {
    id: 't3',
    name: 'Quote Acceptance',
    subject: 'Quote Acceptance - {{projectName}}',
    content: 'Hello {{manufacturerName}},\n\nThank you for your detailed quote for {{projectName}}. After careful review, we would like to move forward with your proposal.\n\nNext Steps:\n1. Please send the formal contract for review\n2. Confirm the production timeline\n3. Provide payment terms and schedule\n\nWe\'re excited to work with you on this project.\n\nBest regards,\n{{userName}}',
    category: 'acceptance',
    variables: ['manufacturerName', 'projectName', 'userName'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    usageCount: 3
  },
  {
    id: 't4',
    name: 'Capability Inquiry',
    subject: 'Manufacturing Capability Inquiry - {{productType}}',
    content: 'Hello {{manufacturerName}},\n\nI hope you\'re doing well. I\'m exploring manufacturing options for {{productType}} and came across your facility.\n\nI\'d like to learn more about:\n- Your manufacturing capabilities for {{material}} products\n- Typical lead times and MOQ requirements\n- Quality certifications and standards\n- Capacity availability for new projects\n\nWould you be available for a brief call to discuss our requirements?\n\nThank you for your time.\n\nBest regards,\n{{userName}}',
    category: 'inquiry',
    variables: ['manufacturerName', 'productType', 'material', 'userName'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    usageCount: 12
  }
];

export const mockPerformanceMetrics: PerformanceMetrics = {
  responseTime: 2.4, // hours
  resolutionRate: 87, // percentage
  customerSatisfaction: 4.6, // out of 5
  activeConversations: 12,
  pendingQuotes: 8,
  completedDeals: 23
};

export const capabilities = [
  'CNC Machining',
  'Sheet Metal',
  'Assembly',
  'Welding',
  'Fabrication',
  'Heat Treatment',
  'Injection Molding',
  'Thermoforming',
  'PCB Assembly',
  'Electronic Testing',
  'Box Build',
  'Investment Casting',
  'Sand Casting',
  'Weaving',
  'Knitting',
  'Dyeing',
  'Cutting',
  'Composite Manufacturing',
  'Autoclave Processing',
  'Prepreg Layup',
  'Swiss Turning',
  'Grinding',
  'Iron Casting',
  'Aluminum Casting',
  'Tool Manufacturing',
  'Precision Grinding',
  'Solar Cell Assembly',
  'Module Manufacturing',
  'Shipbuilding',
  'Marine Welding',
  'Heavy Fabrication',
  'Hydraulic Systems',
  'Agricultural Manufacturing',
  'GPS Integration',
  'Precision Manufacturing',
  'Clean Room Assembly',
  'Validation',
  'Pressure Vessel Manufacturing',
  'Heat Exchanger Fabrication',
  'Piping Systems',
  'Food Grade Manufacturing',
  'Sanitary Welding',
  'Controls Integration',
  'Turbine Manufacturing',
  'Blade Production',
  'Generator Assembly',
  'Custom Woodworking',
  'Finishing',
  'Upholstery',
  'Semiconductor Assembly',
  'Wire Bonding',
  'Package Testing',
  'Marine Equipment Manufacturing',
  'Refrigeration Systems',
  'Stainless Fabrication',
  'Solar Panel Assembly',
  'Battery Integration',
  'Marine Grade Systems',
  'Outdoor Gear Manufacturing',
  'Textile Production',
  'Metal Fabrication',
  'Optical Manufacturing',
  'Precision Grinding',
  'Coating Application',
  'Chemical Equipment Manufacturing',
  'Reactor Fabrication',
  'Process Systems',
  'Marine Electronics Assembly',
  'Waterproof Testing',
  'Navigation Systems',
  'Precision Manufacturing',
  'Calibration Services',
  'Custom Instruments',
  'Composite Boat Building',
  'Fiberglass Molding',
  'Marine Systems',
  'Heavy Equipment Manufacturing',
  'Pressure Systems',
  'Field Services'
];

export const materials = [
  'Aluminum',
  'Steel',
  'Stainless Steel',
  'Carbon Steel',
  'Alloy Steel',
  'Cast Iron',
  'ABS',
  'Polycarbonate',
  'TPU',
  'Nylon',
  'FR4 PCB',
  'Flex PCB',
  'Aluminum Alloys',
  'Steel Alloys',
  'Titanium',
  'Cotton',
  'Wool',
  'Synthetic Fibers',
  'Technical Fabrics',
  'Carbon Fiber',
  'Fiberglass',
  'Kevlar',
  'Epoxy Resins',
  'Polyester',
  'Inconel',
  'Gray Iron',
  'Ductile Iron',
  'Tool Steel',
  'Carbide',
  'High-Speed Steel',
  'Silicon Wafers',
  'Aluminum Frames',
  'Tempered Glass',
  'Marine Steel',
  'Composite Materials',
  'Heavy Steel',
  'Hydraulic Components',
  'Food Grade Stainless Steel',
  'HDPE',
  'Food Safe Plastics',
  'Rare Earth Magnets',
  'Hardwood',
  'Softwood',
  'Veneers',
  'Fabrics',
  'Lead Frames',
  'Bonding Wire',
  'Marine Grade Stainless Steel',
  'Refrigeration Components',
  'Solar Cells',
  'Marine Grade Aluminum',
  'Lithium Batteries',
  'Ripstop Nylon',
  'Gore-Tex',
  'Optical Glass',
  'Crystals',
  'Coatings',
  'Hastelloy',
  'PTFE',
  'Glass-lined Steel',
  'Marine Grade PCBs',
  'Waterproof Housings',
  'Marine Connectors',
  'Precision Metals',
  'Ceramics',
  'Electronic Components',
  'Marine Resins',
  'Marine Hardware',
  'High-strength Steel',
  'Drilling Components'
];

export const certifications = [
  'ISO 9001',
  'AS9100',
  'ITAR',
  'AWS D1.1',
  'ASME',
  'ISO 13485',
  'FDA Registered',
  'IPC-A-610',
  'UL Listed',
  'NADCAP',
  'OEKO-TEX',
  'GOTS',
  'Boeing Approved',
  'TS 16949',
  'IATF 16949',
  'ISO 17025',
  'J-STD-001',
  'AISC Certified',
  'Ford Q1',
  'NASA NSTS-08307',
  'ISO 14001',
  'bluesign approved',
  'IEC 61215',
  'UL 1703',
  'Marine Grade',
  'MIL-STD-9858',
  'ABS Certified',
  'MSHA Approved',
  'ASABE Standards',
  'FDA 21 CFR Part 11',
  'cGMP',
  'API Q1',
  'ASME U-Stamp',
  'PED Certified',
  'NBIC',
  'FDA Food Contact',
  'USDA Approved',
  'NSF Certified',
  'IEC 61400',
  'UL 6142',
  'FSC Certified',
  'GREENGUARD',
  'CARB Phase 2',
  'HACCP Compliant',
  'USCG Approved',
  'NMEA 2000',
  'FCC Certified',
  'CE Marked',
  'NIST Traceable',
  'NMMA Certified',
  'ABYC Standards'
];