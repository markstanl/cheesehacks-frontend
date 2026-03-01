"use client";

import { signOut } from "next-auth/react";
import React from "react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover:underline bg-transparent border-none p-0 cursor-pointer text-white"
    >
      Logout
    </button>
  );
}
