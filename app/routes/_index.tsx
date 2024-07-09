import { Box, Center, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Under Construction" }
    ];
};

export default function Index() {
    return (
        <Center>
            <Box color="warning" bg="red.2" ta="center" my="sm" p="lg">
                <Text fw="bold">🚧 Site under construction 🏗️</Text>
                <Text>
                    We&apos;re still developing this app! Check back soon for more updates.
                </Text>
            </Box>
        </Center>
    );
}
