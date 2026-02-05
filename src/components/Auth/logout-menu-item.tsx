"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

type LogoutMenuItemProps = {
    className?: string;
};

export default function LogoutMenuItem({ className }: LogoutMenuItemProps) {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <button
            type="button"
            onClick={async () => {
                await logout();
                router.refresh();
            }}
            className={className}
        >
            Salir
        </button>
    );
}
