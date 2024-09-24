import type { LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/scripts/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    // TODO maybe log this action?
    return await auth.logout(request, { redirectTo: "/" });
}
