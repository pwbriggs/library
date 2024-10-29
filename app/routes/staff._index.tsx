import { List, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconSparkles } from "@tabler/icons-react";

export default function StaffHome() {
    return (
        <>
            <Title>Staff Home</Title>
            <Text>
                Welcome, wonderful librarians! Here's some staff tools you can
                use:
            </Text>
            <List icon={<IconSparkles />}>
                <List.Item>
                    <Link to="/staff/create-user">Create new user</Link>
                </List.Item>
            </List>
        </>
    );
}
