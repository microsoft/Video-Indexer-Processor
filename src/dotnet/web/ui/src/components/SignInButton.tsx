import { useMsal } from '@azure/msal-react';
import { Link, Persona, PersonaInitialsColor, PersonaSize, Stack, Text } from '@fluentui/react';
import { apiRequest } from '../msalConfig';

export const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = (ev: React.MouseEvent<unknown>) => {
    instance.loginRedirect(apiRequest);
  };

  return (
    <Link
      onClick={handleLogin}
      styles={{
        root: {
          marginRight: 10,
          textDecoration: 'none',
          selectors: {
            ':hover': {
              textDecoration: 'none',
            },
          },
        },
      }}
    >
      <Stack horizontal verticalAlign={'center'} onClick={() => handleLogin}>
        <Persona size={PersonaSize.size32} initialsColor={PersonaInitialsColor.pink} color="#FFFFFF" />
        <Text styles={{ root: { color: '#ffffff' } }}>Sign In</Text>
      </Stack>
    </Link>
  );
};
