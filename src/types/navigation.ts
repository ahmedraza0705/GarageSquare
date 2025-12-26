// ============================================
// NAVIGATION TYPES
// ============================================

export type CustomerStackParamList = {
    Main: undefined;
    VehicleDetail: { vehicleId: string };
    JobCardDetail: { jobCardId: string };
};

export type CompanyAdminStackParamList = {
    Main: undefined;
    JobCardDetail: { jobCardId: string };
    // Add other screens as needed
};

export type ManagerStackParamList = {
    Main: undefined;
    VehicleDetail: { vehicleId: string };
    JobCardDetail: { jobCardId: string };
    // Add other screens as needed
};
