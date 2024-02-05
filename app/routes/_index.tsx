import { Card, Stack, Typography } from "@mui/joy";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Under Construction" }
    ];
};

export default function Index() {
    return (
        <Stack direction="row" justifyContent="center">
            <Card color="warning" variant="soft" sx={{ maxWidth: 500, textAlign: "center" }}>
                <Typography level="h1">🚧 Site under construction 🏗️</Typography>
                <Typography level="body-lg">
                    We&apos;re still developing this app! Check back soon for more updates.
                </Typography>
            </Card>
        </Stack>
    );
}
