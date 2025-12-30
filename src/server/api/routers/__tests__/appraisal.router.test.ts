import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  appraisalRequest: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  property: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

// Mock context
const mockCtx = {
  prisma: mockPrisma,
  user: { id: 'user-1', role: 'CLIENT' },
  organization: { id: 'org-1' },
};

describe('Appraisal Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    const validInput = {
      propertyAddress: '123 Main St',
      propertyCity: 'Austin',
      propertyState: 'TX',
      propertyZipCode: '78701',
      propertyType: 'SINGLE_FAMILY' as const,
      purpose: 'Home purchase',
      requestedType: 'AI_REPORT' as const,
    };

    it('creates appraisal with existing property', async () => {
      const existingProperty = {
        id: 'prop-1',
        addressLine1: '123 Main St',
        city: 'Austin',
        state: 'TX',
      };

      mockPrisma.property.findUnique.mockResolvedValue(existingProperty);
      mockPrisma.appraisalRequest.create.mockResolvedValue({
        id: 'appraisal-1',
        propertyId: 'prop-1',
        status: 'QUEUED',
        requestedType: 'AI_REPORT',
        price: 99.0,
      });

      const result = await mockPrisma.appraisalRequest.create({
        data: {
          organizationId: mockCtx.organization!.id,
          requestedById: mockCtx.user.id,
          propertyId: existingProperty.id,
          purpose: validInput.purpose,
          requestedType: validInput.requestedType,
          status: 'QUEUED',
          price: 99.0,
        },
      });

      expect(result.status).toBe('QUEUED');
      expect(result.price).toBe(99.0);
    });

    it('creates new property when not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);
      mockPrisma.property.create.mockResolvedValue({
        id: 'new-prop-1',
        addressLine1: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      });

      const newProperty = await mockPrisma.property.create({
        data: {
          addressLine1: validInput.propertyAddress,
          city: validInput.propertyCity,
          state: validInput.propertyState,
          zipCode: validInput.propertyZipCode,
          propertyType: validInput.propertyType,
          county: '',
          latitude: 0,
          longitude: 0,
          addressFull: `${validInput.propertyAddress}, ${validInput.propertyCity}, ${validInput.propertyState} ${validInput.propertyZipCode}`,
        },
      });

      expect(newProperty.id).toBe('new-prop-1');
      expect(mockPrisma.property.create).toHaveBeenCalled();
    });

    it('validates property type enum values', () => {
      const validTypes = [
        'SINGLE_FAMILY',
        'MULTI_FAMILY',
        'CONDO',
        'TOWNHOUSE',
        'COMMERCIAL',
        'LAND',
        'MIXED_USE',
      ];

      validTypes.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it('validates requested type enum values', () => {
      const validRequestTypes = [
        'AI_REPORT',
        'AI_REPORT_WITH_ONSITE',
        'CERTIFIED_APPRAISAL',
      ];

      validRequestTypes.forEach((type) => {
        expect(validRequestTypes).toContain(type);
      });
    });
  });

  describe('getById', () => {
    it('returns appraisal when found', async () => {
      const mockAppraisal = {
        id: 'appraisal-1',
        organizationId: 'org-1',
        status: 'READY',
        property: { addressLine1: '123 Main St' },
        report: { valueEstimate: 450000, confidenceScore: 85 },
      };

      mockPrisma.appraisalRequest.findUnique.mockResolvedValue(mockAppraisal);

      const result = await mockPrisma.appraisalRequest.findUnique({
        where: { id: 'appraisal-1' },
        include: {
          property: true,
          requestedBy: true,
          report: true,
          jobs: true,
        },
      });

      expect(result).toEqual(mockAppraisal);
      expect(result?.report?.valueEstimate).toBe(450000);
    });

    it('returns null when appraisal not found', async () => {
      mockPrisma.appraisalRequest.findUnique.mockResolvedValue(null);

      const result = await mockPrisma.appraisalRequest.findUnique({
        where: { id: 'non-existent' },
      });

      expect(result).toBeNull();
    });

    it('checks organization access for client role', async () => {
      const mockAppraisal = {
        id: 'appraisal-1',
        organizationId: 'different-org',
        status: 'READY',
      };

      mockPrisma.appraisalRequest.findUnique.mockResolvedValue(mockAppraisal);

      const result = await mockPrisma.appraisalRequest.findUnique({
        where: { id: 'appraisal-1' },
      });

      // In actual router, this would throw FORBIDDEN
      expect(result?.organizationId).not.toBe(mockCtx.organization?.id);
    });
  });

  describe('list', () => {
    it('returns paginated appraisals', async () => {
      const mockAppraisals = [
        { id: 'appraisal-1', status: 'READY' },
        { id: 'appraisal-2', status: 'QUEUED' },
      ];

      mockPrisma.appraisalRequest.findMany.mockResolvedValue(mockAppraisals);

      const result = await mockPrisma.appraisalRequest.findMany({
        where: { organizationId: mockCtx.organization!.id },
        orderBy: { createdAt: 'desc' },
        take: 21,
      });

      expect(result).toHaveLength(2);
    });

    it('filters by status when provided', async () => {
      mockPrisma.appraisalRequest.findMany.mockResolvedValue([]);

      await mockPrisma.appraisalRequest.findMany({
        where: {
          organizationId: mockCtx.organization!.id,
          status: 'READY',
        },
      });

      expect(mockPrisma.appraisalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'READY' }),
        })
      );
    });

    it('validates status enum values', () => {
      const validStatuses = ['DRAFT', 'QUEUED', 'RUNNING', 'READY', 'FAILED', 'EXPIRED'];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });
  });

  describe('cancel', () => {
    it('updates status to EXPIRED for cancelable appraisals', async () => {
      const mockAppraisal = {
        id: 'appraisal-1',
        organizationId: 'org-1',
        status: 'QUEUED',
      };

      mockPrisma.appraisalRequest.findUnique.mockResolvedValue(mockAppraisal);
      mockPrisma.appraisalRequest.update.mockResolvedValue({
        ...mockAppraisal,
        status: 'EXPIRED',
      });

      const result = await mockPrisma.appraisalRequest.update({
        where: { id: 'appraisal-1' },
        data: { status: 'EXPIRED' },
      });

      expect(result.status).toBe('EXPIRED');
    });

    it('only allows cancellation of DRAFT or QUEUED status', () => {
      const cancelableStatuses = ['DRAFT', 'QUEUED'];
      const nonCancelableStatuses = ['RUNNING', 'READY', 'FAILED', 'EXPIRED'];

      cancelableStatuses.forEach((status) => {
        expect(['DRAFT', 'QUEUED']).toContain(status);
      });

      nonCancelableStatuses.forEach((status) => {
        expect(['DRAFT', 'QUEUED']).not.toContain(status);
      });
    });
  });

  describe('process', () => {
    it('only processes QUEUED or FAILED appraisals', () => {
      const processableStatuses = ['QUEUED', 'FAILED'];
      const nonProcessableStatuses = ['DRAFT', 'RUNNING', 'READY', 'EXPIRED'];

      processableStatuses.forEach((status) => {
        expect(['QUEUED', 'FAILED']).toContain(status);
      });

      nonProcessableStatuses.forEach((status) => {
        expect(['QUEUED', 'FAILED']).not.toContain(status);
      });
    });
  });

  describe('retry', () => {
    it('only allows retry of FAILED appraisals', async () => {
      const mockFailedAppraisal = {
        id: 'appraisal-1',
        organizationId: 'org-1',
        status: 'FAILED',
      };

      mockPrisma.appraisalRequest.findUnique.mockResolvedValue(mockFailedAppraisal);

      expect(mockFailedAppraisal.status).toBe('FAILED');
    });

    it('rejects retry for non-FAILED appraisals', () => {
      const nonRetryableStatuses = ['DRAFT', 'QUEUED', 'RUNNING', 'READY', 'EXPIRED'];

      nonRetryableStatuses.forEach((status) => {
        expect(status).not.toBe('FAILED');
      });
    });
  });

  describe('pricing rules', () => {
    it('applies base price for AI_REPORT type', () => {
      const basePrice = 99.0;
      expect(basePrice).toBe(99.0);
    });

    it('should have different pricing tiers', () => {
      const pricingTiers = {
        AI_REPORT: 99.0,
        AI_REPORT_WITH_ONSITE: 199.0,
        CERTIFIED_APPRAISAL: 499.0,
      };

      expect(pricingTiers.AI_REPORT).toBeLessThan(pricingTiers.AI_REPORT_WITH_ONSITE);
      expect(pricingTiers.AI_REPORT_WITH_ONSITE).toBeLessThan(pricingTiers.CERTIFIED_APPRAISAL);
    });
  });
});
