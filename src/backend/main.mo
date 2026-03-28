import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();

  type User = {
    principal: Principal;
    name: Text;
    phone: Text;
    email: Text;
    lat: Float;
    lng: Float;
    walletBalance: Nat;
    rating: Float;
    isAvailable: Bool;
    taskerMode: Bool;
  };

  type Task = {
    id: Nat;
    title: Text;
    description: Text;
    amount: Nat;
    tip: Nat;
    status: Text; // posted | accepted | inprogress | otp_pending | completed | cancelled
    customerId: Principal;
    taskerId: ?Principal;
    storeAddress: Text;
    storeLat: Float;
    storeLng: Float;
    customerLat: Float;
    customerLng: Float;
    createdAt: Int;
  };

  type Payment = {
    taskId: Nat;
    amount: Nat;
    platformFee: Nat;
    taskerEarning: Nat;
    released: Bool;
  };

  type OTPEntry = { otp: Text; verified: Bool };

  stable var nextTaskId: Nat = 1;
  let users = Map.empty<Principal, User>();
  let tasks = Map.empty<Nat, Task>();
  let otps = Map.empty<Nat, OTPEntry>();
  let payments = Map.empty<Nat, Payment>();

  include MixinAuthorization(accessControlState);

  // ---- Users ----

  public shared ({ caller }) func createOrUpdateUser(name: Text, phone: Text, email: Text, lat: Float, lng: Float) : async User {
    let existing = users.get(caller);
    let u : User = {
      principal = caller;
      name;
      phone;
      email;
      lat;
      lng;
      walletBalance = switch existing { case (?e) e.walletBalance; case null 0 };
      rating = switch existing { case (?e) e.rating; case null 5.0 };
      isAvailable = true;
      taskerMode = false;
    };
    users.add(caller, u);
    u
  };

  public shared ({ caller }) func updateLocation(lat: Float, lng: Float) : async () {
    switch (users.get(caller)) {
      case (?u) { users.add(caller, { u with lat; lng }); };
      case null {};
    };
  };

  public shared ({ caller }) func toggleTaskerMode(enabled: Bool) : async () {
    switch (users.get(caller)) {
      case (?u) { users.add(caller, { u with taskerMode = enabled; isAvailable = enabled }); };
      case null {};
    };
  };

  public query ({ caller }) func getMyProfile() : async ?User {
    users.get(caller)
  };

  // ---- Tasks ----

  public shared ({ caller }) func postTask(
    title: Text, description: Text, amount: Nat, tip: Nat,
    storeAddress: Text, storeLat: Float, storeLng: Float,
    customerLat: Float, customerLng: Float
  ) : async Task {
    let id = nextTaskId;
    nextTaskId += 1;
    let platformFee : Nat = if (amount > 500) 5 else 3;
    let total = amount + tip;
    let taskerEarning : Nat = if (total > platformFee) total - platformFee else 0;
    let t : Task = {
      id; title; description; amount; tip;
      status = "posted";
      customerId = caller; taskerId = null;
      storeAddress; storeLat; storeLng; customerLat; customerLng;
      createdAt = Time.now();
    };
    tasks.add(id, t);
    payments.add(id, { taskId = id; amount = total; platformFee; taskerEarning; released = false });
    switch (users.get(caller)) {
      case (?u) {
        if (u.walletBalance >= total) {
          users.add(caller, { u with walletBalance = u.walletBalance - total });
        };
      };
      case null {};
    };
    t
  };

  func haversineKm(lat1: Float, lng1: Float, lat2: Float, lng2: Float) : Float {
    let r = 6371.0;
    let dLat = (lat2 - lat1) * Float.pi / 180.0;
    let dLng = (lng2 - lng1) * Float.pi / 180.0;
    let a = Float.sin(dLat / 2.0) * Float.sin(dLat / 2.0) +
            Float.cos(lat1 * Float.pi / 180.0) * Float.cos(lat2 * Float.pi / 180.0) *
            Float.sin(dLng / 2.0) * Float.sin(dLng / 2.0);
    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    r * c
  };

  public query ({ caller }) func getNearbyTasks(lat: Float, lng: Float, radiusKm: Float) : async [Task] {
    var result = List.empty<Task>();
    for ((_, t) in tasks.entries()) {
      if (t.status == "posted" and t.customerId != caller) {
        let dist = haversineKm(lat, lng, t.customerLat, t.customerLng);
        if (dist <= radiusKm) {
          result.add(t);
        };
      };
    };
    result.toArray()
  };

  public shared ({ caller }) func acceptTask(taskId: Nat) : async { ok: Bool; message: Text } {
    switch (tasks.get(taskId)) {
      case (?t) {
        if (t.status != "posted") return { ok = false; message = "Task not available" };
        if (t.customerId == caller) return { ok = false; message = "Cannot accept own task" };
        tasks.add(taskId, { t with status = "accepted"; taskerId = ?caller });
        { ok = true; message = "Task accepted" }
      };
      case null { { ok = false; message = "Task not found" } };
    };
  };

  public shared ({ caller }) func startTask(taskId: Nat) : async { ok: Bool; message: Text } {
    switch (tasks.get(taskId)) {
      case (?t) {
        let isTasker = switch (t.taskerId) { case (?tid) tid == caller; case null false };
        if (not isTasker) return { ok = false; message = "Not authorized" };
        if (t.status != "accepted") return { ok = false; message = "Invalid state" };
        tasks.add(taskId, { t with status = "inprogress" });
        { ok = true; message = "Task in progress" }
      };
      case null { { ok = false; message = "Task not found" } };
    };
  };

  public shared ({ caller }) func generateOTP(taskId: Nat) : async { ok: Bool; otp: Text } {
    switch (tasks.get(taskId)) {
      case (?t) {
        if (t.customerId != caller) return { ok = false; otp = "" };
        if (t.status != "inprogress") return { ok = false; otp = "" };
        let raw : Int = Time.now() % 9000 + 1000;
        let otp = Int.abs(raw).toText();
        otps.add(taskId, { otp; verified = false });
        tasks.add(taskId, { t with status = "otp_pending" });
        { ok = true; otp }
      };
      case null { { ok = false; otp = "" } };
    };
  };

  public shared ({ caller }) func verifyOTP(taskId: Nat, otp: Text) : async { ok: Bool; message: Text } {
    switch (tasks.get(taskId)) {
      case (?t) {
        let isTasker = switch (t.taskerId) { case (?tid) tid == caller; case null false };
        if (not isTasker) return { ok = false; message = "Not authorized" };
        switch (otps.get(taskId)) {
          case (?o) {
            if (o.otp == otp) {
              otps.add(taskId, { o with verified = true });
              tasks.add(taskId, { t with status = "completed" });
              switch (payments.get(taskId)) {
                case (?p) {
                  payments.add(taskId, { p with released = true });
                  switch (t.taskerId) {
                    case (?tid) {
                      switch (users.get(tid)) {
                        case (?u) { users.add(tid, { u with walletBalance = u.walletBalance + p.taskerEarning }); };
                        case null {};
                      };
                    };
                    case null {};
                  };
                };
                case null {};
              };
              { ok = true; message = "OTP verified, payment released!" }
            } else { { ok = false; message = "Wrong OTP" } }
          };
          case null { { ok = false; message = "OTP not found" } };
        };
      };
      case null { { ok = false; message = "Task not found" } };
    };
  };

  public shared ({ caller }) func cancelTask(taskId: Nat) : async { ok: Bool; message: Text } {
    switch (tasks.get(taskId)) {
      case (?t) {
        if (t.customerId != caller) return { ok = false; message = "Not authorized" };
        if (t.status == "completed") return { ok = false; message = "Already completed" };
        tasks.add(taskId, { t with status = "cancelled" });
        switch (payments.get(taskId)) {
          case (?p) {
            if (not p.released) {
              switch (users.get(caller)) {
                case (?u) { users.add(caller, { u with walletBalance = u.walletBalance + p.amount }); };
                case null {};
              };
              payments.add(taskId, { p with released = true });
            };
          };
          case null {};
        };
        { ok = true; message = "Cancelled and refunded" }
      };
      case null { { ok = false; message = "Task not found" } };
    };
  };

  public query ({ caller }) func getTask(taskId: Nat) : async ?Task {
    tasks.get(taskId)
  };

  public query ({ caller }) func getMyTasksAsCustomer() : async [Task] {
    var result = List.empty<Task>();
    for ((_, t) in tasks.entries()) {
      if (t.customerId == caller) { result.add(t); };
    };
    result.toArray()
  };

  public query ({ caller }) func getMyTasksAsTasker() : async [Task] {
    var result = List.empty<Task>();
    for ((_, t) in tasks.entries()) {
      switch (t.taskerId) {
        case (?tid) { if (tid == caller) { result.add(t); }; };
        case null {};
      };
    };
    result.toArray()
  };

  // ---- Wallet ----

  public query ({ caller }) func getWalletBalance() : async Nat {
    switch (users.get(caller)) { case (?u) u.walletBalance; case null 0 }
  };

  public shared ({ caller }) func addToWallet(amount: Nat) : async Nat {
    switch (users.get(caller)) {
      case (?u) {
        let newBal = u.walletBalance + amount;
        users.add(caller, { u with walletBalance = newBal });
        newBal
      };
      case null { amount };
    };
  };

  public query ({ caller }) func getEarningsHistory() : async [Payment] {
    var result = List.empty<Payment>();
    for ((_, t) in tasks.entries()) {
      switch (t.taskerId) {
        case (?tid) {
          if (tid == caller) {
            switch (payments.get(t.id)) {
              case (?p) { result.add(p); };
              case null {};
            };
          };
        };
        case null {};
      };
    };
    result.toArray()
  };

  public query func getPlatformStats() : async { totalTasks: Nat; completedTasks: Nat; totalVolume: Nat } {
    var total = 0;
    var completed = 0;
    var volume = 0;
    for ((_, t) in tasks.entries()) {
      total += 1;
      if (t.status == "completed") {
        completed += 1;
        volume += t.amount + t.tip;
      };
    };
    { totalTasks = total; completedTasks = completed; totalVolume = volume }
  };
};
