"use client";

import { signOut } from "next-auth/react";
import React from "react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-transparent border-none p-0 cursor-pointer text-light-grey hover:text-primary transition-colors text-sm"
    >
      Logout
    </button>
  );
}
