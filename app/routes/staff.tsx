import { LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/scripts/auth.server";
import { trimUrl } from "~/scripts/urls.server";


export async function loader({ request }: LoaderFunctionArgs) {
    const user = await auth.isAuthenticated(request, { failureRedirect: `/login?next=${trimUrl(request.url)}` });
    if (!user.isLibrarian) {
        throw new Response(null, {
            status: 403,
            statusText: "Forbidden",
        });
    }
    return null;
}
