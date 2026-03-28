import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface User {
    principal: Principal;
    name: string;
    phone: string;
    email: string;
    lat: number;
    lng: number;
    walletBalance: bigint;
    rating: number;
    isAvailable: boolean;
    taskerMode: boolean;
}

export interface Task {
    id: bigint;
    title: string;
    description: string;
    amount: bigint;
    tip: bigint;
    status: string;
    customerId: Principal;
    taskerId: Option<Principal>;
    storeAddress: string;
    storeLat: number;
    storeLng: number;
    customerLat: number;
    customerLng: number;
    createdAt: bigint;
}

export interface Payment {
    taskId: bigint;
    amount: bigint;
    platformFee: bigint;
    taskerEarning: bigint;
    released: boolean;
}

export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    createOrUpdateUser(name: string, phone: string, email: string, lat: number, lng: number): Promise<User>;
    updateLocation(lat: number, lng: number): Promise<void>;
    toggleTaskerMode(enabled: boolean): Promise<void>;
    getMyProfile(): Promise<Option<User>>;
    postTask(title: string, description: string, amount: bigint, tip: bigint, storeAddress: string, storeLat: number, storeLng: number, customerLat: number, customerLng: number): Promise<Task>;
    getNearbyTasks(lat: number, lng: number, radiusKm: number): Promise<Task[]>;
    acceptTask(taskId: bigint): Promise<{ ok: boolean; message: string }>;
    startTask(taskId: bigint): Promise<{ ok: boolean; message: string }>;
    generateOTP(taskId: bigint): Promise<{ ok: boolean; otp: string }>;
    verifyOTP(taskId: bigint, otp: string): Promise<{ ok: boolean; message: string }>;
    cancelTask(taskId: bigint): Promise<{ ok: boolean; message: string }>;
    getTask(taskId: bigint): Promise<Option<Task>>;
    getMyTasksAsCustomer(): Promise<Task[]>;
    getMyTasksAsTasker(): Promise<Task[]>;
    getWalletBalance(): Promise<bigint>;
    addToWallet(amount: bigint): Promise<bigint>;
    getEarningsHistory(): Promise<Payment[]>;
    getPlatformStats(): Promise<{ totalTasks: bigint; completedTasks: bigint; totalVolume: bigint }>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
}
