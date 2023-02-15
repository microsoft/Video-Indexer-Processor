import { render, screen } from '@testing-library/react';
import Collapsible from '../../components/Collapsible';
import { Checkbox, initializeIcons, Stack } from '@fluentui/react';

// Initialize icons in case this example uses them
initializeIcons();

describe('Collapsible component', () => {
  test('Component renders correctly', () => {
    let labelName = 'TEST_LABEL_NAME';

    render(<Collapsible label={labelName} />);

    let collapsibleLabelText = screen.getByText(labelName);

    expect(collapsibleLabelText).toBeInTheDocument();
  });

  test('Inner components are rendered correctly', () => {
    render(
      <Collapsible label="Country" isOpen={true}>
        <Stack>
          <Checkbox label="China" />
          <Checkbox label="France" />
        </Stack>
      </Collapsible>,
    );

    expect(screen.getByText('China')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});
