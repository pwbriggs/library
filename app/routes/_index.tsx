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
            <Card color="warning" variant="soft" sx={{ width: 500 }}>
                <Typography level="h1">🚧 Site under construction 🏗️</Typography>
                <Typography>We&apos;re still developing this app! Check back soon for more updates.</Typography>
            </Card>
        </Stack>
    );
}
