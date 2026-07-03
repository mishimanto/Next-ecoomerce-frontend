"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import PasswordField from "../Common/PasswordInput";
import {
  changePassword,
  fetchAccountOrders,
  fetchCurrentUser,
  getUser,
  logout,
  updateProfile,
  updateProfileImage,
} from "@/services/auth";
import { formatCurrency } from "@/lib/currency";

type AccountUser = NonNullable<ReturnType<typeof getUser>>;
type AccountOrder = Awaited<ReturnType<typeof fetchAccountOrders>>["orders"][number];

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

const MyAccount = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersMeta, setOrdersMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [avatarStatus, setAvatarStatus] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const memberSince = useMemo(() => {
    if (!user?.created_at) {
      return "New member";
    }

    return new Date(user.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }, [user?.created_at]);

  useEffect(() => {
    const cachedUser = getUser();

    if (cachedUser) {
      setUser(cachedUser);
      setProfile(profileFromUser(cachedUser));
    }

    fetchCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        setProfile(profileFromUser(freshUser));
      })
      .catch(() => router.push("/signin"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (activeTab !== "orders") {
      return;
    }

    setOrdersLoading(true);
    fetchAccountOrders(ordersPage)
      .then((data) => {
        setOrders(data.orders);
        setOrdersMeta(data.meta || null);
      })
      .catch((error) =>
        setPasswordStatus(error instanceof Error ? error.message : "Unable to load orders.")
      )
      .finally(() => setOrdersLoading(false));
  }, [activeTab, ordersPage]);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileStatus("");

    try {
      const data = await updateProfile(profile);
      setUser(data.user);
      setProfile(profileFromUser(data.user));
      setProfileStatus(data.message);
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const data = await changePassword({
        current_password: String(formData.get("current_password") || ""),
        password: String(formData.get("password") || ""),
        password_confirmation: String(formData.get("password_confirmation") || ""),
      });
      setPasswordStatus(data.message);
      form.reset();
    } catch (error) {
      setPasswordStatus(error instanceof Error ? error.message : "Unable to change password.");
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarStatus("");
    setAvatarUploading(true);

    try {
      const data = await updateProfileImage(file);
      setUser(data.user);
      setProfile(profileFromUser(data.user));
      setAvatarStatus(data.message);
    } catch (error) {
      setAvatarStatus(
        error instanceof Error ? error.message : "Unable to update profile image."
      );
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title="My Account" pages={["my account"]} />
        <section className="overflow-hidden py-10 bg-gray-2">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white shadow-1 rounded-xl p-8 text-center">
              Loading account...
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="My Account" pages={["my account"]} />

      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <aside className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="p-4 sm:p-7.5 xl:p-9 border-b border-gray-3">
                <ProfileAvatar user={user} className="mb-4" />
                <p className="font-medium text-dark mb-0.5">{user?.name}</p>
                <p className="text-custom-xs">Member since {memberSince}</p>
              </div>

              <div className="p-4 sm:p-7.5 xl:p-9">
                <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                  {[
                    ["dashboard", "Dashboard"],
                    ["orders", "Orders"],
                    ["details", "Account Details"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`text-left rounded-md py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === key ? "text-white bg-blue" : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      {label}
                    </button>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="text-left rounded-md py-3 px-4.5 text-dark-2 bg-gray-1 ease-out duration-200 hover:bg-red hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </aside>

            <div className="xl:max-w-[770px] w-full">
              {activeTab === "dashboard" && (
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl text-dark mb-5">
                    Account Overview
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InfoCard label="Name" value={user?.name || "-"} />
                    <InfoCard label="Email" value={user?.email || "-"} />
                    <InfoCard label="Phone" value={user?.phone || "Not added"} />
                    <InfoCard
                      label="Address"
                      value={[user?.address, user?.city, user?.country]
                        .filter(Boolean)
                        .join(", ") || "Not added"}
                    />
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl text-dark mb-5">Orders</h2>

                  {ordersLoading ? (
                    <p>Loading orders...</p>
                  ) : orders.length > 0 ? (
                    <div>
                      <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left">
                          <thead>
                            <tr className="border-b border-gray-3">
                              <th className="py-3 pr-4 font-medium text-dark">Order</th>
                              <th className="py-3 pr-4 font-medium text-dark">Date</th>
                              <th className="py-3 pr-4 font-medium text-dark">Status</th>
                              <th className="py-3 pr-4 font-medium text-dark">Items</th>
                              <th className="py-3 font-medium text-dark">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr key={order.id} className="border-b border-gray-3 last:border-0">
                                <td className="py-4 pr-4 text-custom-sm"><a href={`/payment/${order.payment_token}/success`} className="text-blue-500 hover:underline">{order.order_number}</a></td>
                                <td className="py-4 pr-4 text-custom-sm">{order.date || "-"}</td>
                                <td className="py-4 pr-4 text-custom-sm capitalize">{order.status}</td>
                                <td className="py-4 pr-4 text-custom-sm">{order.items_count}</td>
                                <td className="py-4 text-custom-sm">{formatCurrency(order.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {ordersMeta && ordersMeta.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <p className="text-custom-sm text-dark-4">
                            Page {ordersMeta.current_page} of {ordersMeta.last_page} - {ordersMeta.total} orders
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={ordersPage <= 1 || ordersLoading}
                              onClick={() => setOrdersPage((page) => Math.max(1, page - 1))}
                              className="rounded-md border border-gray-3 px-4 py-2 text-custom-sm disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              disabled={ordersPage >= ordersMeta.last_page || ordersLoading}
                              onClick={() => setOrdersPage((page) => page + 1)}
                              className="rounded-md border border-gray-3 px-4 py-2 text-custom-sm disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>You don&apos;t have any orders yet.</p>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div className="flex flex-col gap-7.5">
                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h2 className="font-medium text-xl text-dark mb-5">
                      Profile Image
                    </h2>

                    {avatarStatus && (
                      <div className="mb-5 rounded-md bg-gray-1 px-5 py-3 text-dark">
                        {avatarStatus}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <ProfileAvatar user={user} className="shrink-0" size="large" />

                      <div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button
                          type="button"
                          disabled={avatarUploading}
                          onClick={() => avatarInputRef.current?.click()}
                          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-dark-5"
                        >
                          {avatarUploading ? "Uploading..." : "Upload Image"}
                        </button>
                        <p className="mt-3 text-custom-xs text-dark-4">
                          JPG, PNG or WebP. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h2 className="font-medium text-xl text-dark mb-5">
                      Account Details
                    </h2>
                    {profileStatus && (
                      <div className="mb-5 rounded-md bg-gray-1 px-5 py-3 text-dark">
                        {profileStatus}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5 mb-5">
                      <AccountInput label="Name" name="name" value={profile.name} onChange={setProfile} required />
                      <AccountInput label="Email" name="email" type="email" value={profile.email} onChange={setProfile} required />
                      <AccountInput label="Phone" name="phone" value={profile.phone} onChange={setProfile} />
                      <AccountInput label="City" name="city" value={profile.city} onChange={setProfile} />
                      <AccountInput label="Country" name="country" value={profile.country} onChange={setProfile} />
                      <AccountInput label="Address" name="address" value={profile.address} onChange={setProfile} />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Save Changes
                    </button>
                  </form>

                  <form onSubmit={handlePasswordSubmit} className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <h2 className="font-medium text-xl text-dark mb-5">
                      Password Change
                    </h2>
                    {passwordStatus && (
                      <div className="mb-5 rounded-md bg-gray-1 px-5 py-3 text-dark">
                        {passwordStatus}
                      </div>
                    )}

                    <div className="grid gap-5 mb-5">
                      <PasswordInput label="Current Password" name="current_password" />
                      <PasswordInput label="New Password" name="password" />
                      <PasswordInput label="Confirm New Password" name="password_confirmation" />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Change Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

function profileFromUser(user: AccountUser) {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    country: user.country || "",
  };
}

function ProfileAvatar({
  user,
  className = "",
  size = "default",
}: {
  user: AccountUser | null;
  className?: string;
  size?: "default" | "large";
}) {
  const sizeClass = size === "large" ? "w-24 h-24 text-3xl" : "w-16 h-16 text-2xl";

  if (user?.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.name ? `${user.name} profile` : "Profile image"}
        width={size === "large" ? 96 : 64}
        height={size === "large" ? 96 : 64}
        unoptimized
        className={`${sizeClass} ${className} rounded-full object-cover bg-gray-2`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${className} rounded-full bg-blue text-white flex items-center justify-center font-semibold`}
    >
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-1 p-4">
      <p className="text-custom-xs text-dark-4 mb-1">{label}</p>
      <p className="font-medium text-dark break-words">{value}</p>
    </div>
  );
}

function AccountInput({
  label,
  name,
  type = "text",
  value,
  required = false,
  onChange,
}: {
  label: string;
  name: keyof typeof emptyProfile;
  type?: string;
  value: string;
  required?: boolean;
  onChange: React.Dispatch<React.SetStateAction<typeof emptyProfile>>;
}) {
  return (
    <div>
      <label htmlFor={name} className="block mb-2.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        required={required}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
      />
    </div>
  );
}

function PasswordInput({ label, name }: { label: string; name: string }) {
  return (
    <PasswordField
      label={label}
      name={name}
      id={name}
      required
      autoComplete={name === "current_password" ? "current-password" : "new-password"}
      wrapperClassName=""
      inputClassName="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 pl-5 pr-20 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
    />
  );
}

export default MyAccount;
