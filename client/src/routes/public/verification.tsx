import { Box } from '@mantine/core';
import { Verification } from '@/features/auth';
import { Footer } from '@/components';

export function VerificationRoute() {
  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box style={{ flex: 1 }}>
        <Verification />
      </Box>
      <Box style={{ flexShrink: 0, height: '10%', minHeight: '50px' }}>
        <Footer
          links={[
            { label: 'Learn', link: '/learn' },
            { label: 'About', link: '/about' },
          ]}
        />
      </Box>
    </Box>
  );
}
