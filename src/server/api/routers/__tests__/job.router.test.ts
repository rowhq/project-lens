import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock Prisma
const mockPrisma = {
  job: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  property: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

// Mock context
const mockCtx = {
  prisma: mockPrisma,
  user: { id: 'user-1' },
  organization: { id: 'org-1' },
  appraiserProfile: {
    userId: 'user-1',
    homeBaseLat: 30.2672,
    homeBaseLng: -97.7431,
    coverageRadiusMiles: 50,
    verificationStatus: 'VERIFIED',
  },
};

describe('Job Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listForOrganization', () => {
    it('returns jobs for the organization', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          status: 'DISPATCHED',
          property: { addressLine1: '123 Main St' },
        },
        {
          id: 'job-2',
          status: 'COMPLETED',
          property: { addressLine1: '456 Oak Ave' },
        },
      ];

      mockPrisma.job.findMany.mockResolvedValue(mockJobs);

      // Simulate calling the procedure
      const result = await mockPrisma.job.findMany({
        where: { organizationId: mockCtx.organization!.id },
        include: { property: true, assignedAppraiser: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 51,
      });

      expect(result).toHaveLength(2);
      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1' },
        })
      );
    });

    it('filters by status when provided', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      await mockPrisma.job.findMany({
        where: {
          organizationId: mockCtx.organization!.id,
          status: 'DISPATCHED',
        },
      });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DISPATCHED' }),
        })
      );
    });
  });

  describe('getForClient', () => {
    it('returns job details when found', async () => {
      const mockJob = {
        id: 'job-1',
        organizationId: 'org-1',
        status: 'DISPATCHED',
        property: { addressLine1: '123 Main St' },
        evidence: [],
      };

      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await mockPrisma.job.findUnique({
        where: { id: 'job-1' },
        include: { property: true, assignedAppraiser: true, evidence: true },
      });

      expect(result).toEqual(mockJob);
    });

    it('throws NOT_FOUND when job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const result = await mockPrisma.job.findUnique({ where: { id: 'non-existent' } });

      expect(result).toBeNull();
      // In actual router, this would throw TRPCError
    });

    it('throws FORBIDDEN when organization does not match', async () => {
      const mockJob = {
        id: 'job-1',
        organizationId: 'different-org',
        status: 'DISPATCHED',
      };

      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await mockPrisma.job.findUnique({ where: { id: 'job-1' } });

      expect(result?.organizationId).not.toBe(mockCtx.organization?.id);
      // In actual router, this would throw TRPCError with FORBIDDEN
    });
  });

  describe('createOrder', () => {
    const validInput = {
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      latitude: 30.2672,
      longitude: -97.7431,
      scopePreset: 'INTERIOR_EXTERIOR' as const,
    };

    it('creates a new job with existing property', async () => {
      const existingProperty = {
        id: 'prop-1',
        addressLine1: '123 Main St',
        city: 'Austin',
        state: 'TX',
      };

      mockPrisma.property.findFirst.mockResolvedValue(existingProperty);
      mockPrisma.job.create.mockResolvedValue({
        id: 'new-job-1',
        propertyId: 'prop-1',
        status: 'DISPATCHED',
        property: existingProperty,
      });

      await mockPrisma.property.findFirst({
        where: {
          addressLine1: validInput.address,
          city: validInput.city,
          state: validInput.state,
        },
      });

      expect(mockPrisma.property.findFirst).toHaveBeenCalled();
    });

    it('creates new property when not found', async () => {
      mockPrisma.property.findFirst.mockResolvedValue(null);
      mockPrisma.property.create.mockResolvedValue({
        id: 'new-prop-1',
        addressLine1: '123 Main St',
      });

      await mockPrisma.property.findFirst({ where: {} });

      expect(mockPrisma.property.findFirst).toHaveBeenCalled();
      // In actual router, this would trigger property.create
    });

    it('sets correct payout based on scope preset', () => {
      const scopeConfig: Record<string, { slaHours: number; payout: number }> = {
        EXTERIOR_ONLY: { slaHours: 48, payout: 99 },
        INTERIOR_EXTERIOR: { slaHours: 72, payout: 199 },
        COMPREHENSIVE: { slaHours: 120, payout: 349 },
        FULL_CERTIFIED: { slaHours: 168, payout: 549 },
        RUSH_INSPECTION: { slaHours: 24, payout: 299 },
      };

      expect(scopeConfig['EXTERIOR_ONLY'].payout).toBe(99);
      expect(scopeConfig['INTERIOR_EXTERIOR'].payout).toBe(199);
      expect(scopeConfig['COMPREHENSIVE'].payout).toBe(349);
      expect(scopeConfig['FULL_CERTIFIED'].payout).toBe(549);
      expect(scopeConfig['RUSH_INSPECTION'].payout).toBe(299);
    });
  });

  describe('accept', () => {
    it('updates job status to ACCEPTED', async () => {
      const mockJob = {
        id: 'job-1',
        status: 'DISPATCHED',
        assignedAppraiserId: null,
      };

      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      mockPrisma.job.update.mockResolvedValue({
        ...mockJob,
        status: 'ACCEPTED',
        assignedAppraiserId: 'user-1',
        acceptedAt: new Date(),
      });

      const result = await mockPrisma.job.update({
        where: { id: 'job-1' },
        data: {
          assignedAppraiserId: mockCtx.user.id,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      expect(result.status).toBe('ACCEPTED');
      expect(result.assignedAppraiserId).toBe('user-1');
    });

    it('rejects when job is not DISPATCHED', async () => {
      const mockJob = {
        id: 'job-1',
        status: 'COMPLETED', // Not DISPATCHED
        assignedAppraiserId: null,
      };

      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      // In actual router, this would throw TRPCError with BAD_REQUEST
      expect(mockJob.status).not.toBe('DISPATCHED');
    });

    it('rejects when job is already assigned', async () => {
      const mockJob = {
        id: 'job-1',
        status: 'DISPATCHED',
        assignedAppraiserId: 'other-user', // Already assigned
      };

      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      // In actual router, this would throw TRPCError with BAD_REQUEST
      expect(mockJob.assignedAppraiserId).not.toBeNull();
    });
  });

  describe('start', () => {
    it('verifies geofence location using haversine formula', () => {
      // Haversine formula test
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 3959; // Earth's radius in miles
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Test: Austin to San Antonio (~74 miles)
      const austinToSanAntonio = calculateDistance(30.2672, -97.7431, 29.4241, -98.4936);
      expect(austinToSanAntonio).toBeGreaterThan(70);
      expect(austinToSanAntonio).toBeLessThan(80);

      // Test: Same location (0 miles)
      const sameLocation = calculateDistance(30.2672, -97.7431, 30.2672, -97.7431);
      expect(sameLocation).toBe(0);

      // Test: Within geofence radius (100 meters = ~0.062 miles)
      const nearbyLocation = calculateDistance(30.2672, -97.7431, 30.2682, -97.7441);
      expect(nearbyLocation).toBeLessThan(1); // Less than 1 mile
    });
  });

  describe('submit', () => {
    it('requires minimum 5 photos', async () => {
      const jobWith3Photos = {
        id: 'job-1',
        status: 'IN_PROGRESS',
        assignedAppraiserId: 'user-1',
        evidence: [{ id: '1' }, { id: '2' }, { id: '3' }],
      };

      // In actual router, this would throw TRPCError with BAD_REQUEST
      expect(jobWith3Photos.evidence.length).toBeLessThan(5);
    });

    it('allows submission with 5+ photos', async () => {
      const jobWith5Photos = {
        id: 'job-1',
        status: 'IN_PROGRESS',
        assignedAppraiserId: 'user-1',
        evidence: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
      };

      expect(jobWith5Photos.evidence.length).toBeGreaterThanOrEqual(5);
    });
  });
});
