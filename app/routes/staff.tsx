import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { auth } from "~/scripts/auth.server";
import { trimUrl } from "~/scripts/urls.server";

export default function staffHeader() {
    return (
        <>
            <header style={{ backgroundColor: "green", color: "white" }}>
                <Link to="/staff" style={{ color: "white" }}>
                    Staff home
                </Link>
            </header>
            <Outlet />
        </>
    );
}

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await auth.isAuthenticated(request, {
        failureRedirect: `/login?next=${trimUrl(request.url)}`,
    });
    if (!user.isLibrarian) {
        throw new Response(null, {
            status: 403,
            statusText: "Forbidden",
        });
    }
    return null;
}
