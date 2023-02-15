import {
  Callout,
  ComboBox,
  DirectionalHint,
  IComboBox,
  IComboBoxOption,
  Label,
  Link,
  PrimaryButton,
  Separator,
  SpinButton,
  Stack,
  TextField,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { useEffect, useState } from 'react';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';

const CalloutDate: React.FunctionComponent = (props) => {
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
  const buttonId = useId('callout-button');
  const [searchIndexParams, setSearchIndexParams] = useSearchIndexParams();
  const [label, setLabel] = useState<string>('');
  const [spinValue, setSpinValue] = useState<string>('10');
  const [cbxOption, setCbxOptions] = useState<IComboBoxOption>({ key: '', text: '' });

  /**
   * Combobox options
   */
  const timeOptions = [
    { key: '', text: '' },
    { key: 'm', text: 'Minutes' },
    { key: 'h', text: 'Hours' },
    { key: 'd', text: 'Days' },
    { key: 'w', text: 'Weeks' },
    { key: 't', text: 'Months' },
    { key: 'y', text: 'Years' },
  ];

  /**
   * set selected time frame
   */
  useEffect(() => {
    if (searchIndexParams.time && searchIndexParams.time.split('-').length === 2) {
      let pValue = +searchIndexParams.time.split('-')[1];
      let pInterval = searchIndexParams.time.split('-')[0];

      let interval = '';

      switch (searchIndexParams.time.split('-')[0]) {
        case 'h':
          interval = pValue <= 1 ? 'hour' : 'hours';
          break;
        case 'd':
          interval = pValue <= 1 ? 'day' : 'days';
          break;
        case 'w':
          interval = pValue <= 1 ? 'weeks' : 'week';
          break;
        case 'm':
          interval = pValue <= 1 ? 'minute' : 'minutes';
          break;
        case 't':
          interval = pValue <= 1 ? 'month' : 'months';
          break;
        case 'y':
          interval = pValue <= 1 ? 'year' : 'years';
          break;
        default:
          interval = '';
          break;
      }
      if (pValue === 0 && pInterval === 'd') {
        setLabel('Today');
      } else if (pValue === 1 && pInterval === 'w') {
        setLabel('Last week');
      } else if (pInterval === 'n') {
        setLabel('All time');
      } else {
        setLabel(`Last ${pValue} ${interval}`);
      }
      setSpinValue(pValue.toString());
      setCbxOptions({ key: pInterval, text: '' });
    } else {
      setLabel('All time');
    }
  }, [searchIndexParams]);

  /**
   * on click set correct index params
   */
  const handleClickOnLink = (tf: string) => {
    setSearchIndexParams({ page: 1, time: tf });
    toggleIsCalloutVisible();
  };

  /**
   * When a user clicks on the custom ok button
   */
  const onCustomClick = () => {
    if (spinValue && +spinValue > 0 && cbxOption) {
      setSearchIndexParams({ page: 1, time: `${cbxOption.key}-${spinValue}` });
    }
  };

  const onSpinChange = (event: React.SyntheticEvent<HTMLElement>, value?: string): void => {
    if (value) {
      setSpinValue(value);
    }
  };

  const onComboBoxChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
    setCbxOptions(option);
  };

  return (
    <>
      <Stack tokens={{ childrenGap: 4 }} verticalAlign={'end'} styles={{ root: { flexDirection: 'row', marginLeft: '5px;' } }}>
        <TextField
          readOnly
          iconProps={{ iconName: 'TimeEntry' }}
          style={{ cursor: 'pointer' }}
          styles={{ fieldGroup: { width: '300px', cursor: 'pointer' } }}
          onPointerDown={toggleIsCalloutVisible}
          id={buttonId}
          value={label}
          role="timer"
        />
        {isCalloutVisible && (
          <Callout
            style={{
              width: '299px',
            }}
            beakWidth={1}
            ariaLabelledBy="time interval"
            ariaDescribedBy="Get a time interval"
            role="dialog"
            gapSpace={0}
            target={`#${buttonId}`}
            directionalHint={DirectionalHint.bottomLeftEdge}
            onDismiss={toggleIsCalloutVisible}
          >
            <Stack style={{ padding: '20px' }} tokens={{ childrenGap: '5px' }}>
              <Label>Quick Select</Label>
              <Stack style={{ paddingTop: '5px' }} horizontal horizontalAlign="space-between">
                <Label>Last</Label>
                <SpinButton
                  styles={{
                    root: { maxWidth: '60px', minWidth: '60px' },
                    spinButtonWrapper: { minWidth: '60px', maxWidth: '60px' },
                    labelWrapper: { minWidth: '60px', maxWidth: '60px' },
                    input: { minWidth: '40px', maxWidth: '40px' },
                  }}
                  value={spinValue}
                  min={0}
                  max={100}
                  step={1}
                  onChange={onSpinChange}
                  incrementButtonAriaLabel="Increase value by 10"
                  decrementButtonAriaLabel="Decrease value by 10"
                />
                <ComboBox selectedKey={cbxOption.key} options={timeOptions} styles={{ root: { maxWidth: 95 } }} onChange={onComboBoxChange}></ComboBox>
                <PrimaryButton text="OK" styles={{ root: { minWidth: 30, maxWidth: 30 } }} onClick={() => onCustomClick()} />
              </Stack>
              <Separator></Separator>
              <Label>Commonly used</Label>
              <Stack as={'div'} style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                <Stack>
                  <Link onClick={() => handleClickOnLink('n-0')}>All time</Link>
                  <Link onClick={() => handleClickOnLink('d-0')}>Today</Link>
                  <Link onClick={() => handleClickOnLink('w-1')}>Last week</Link>
                  <Link onClick={() => handleClickOnLink('m-30')}>Last 30 minutes</Link>
                  <Link onClick={() => handleClickOnLink('h-1')}>Last hour</Link>
                </Stack>
                <Stack>
                  <Link onClick={() => handleClickOnLink('h-24')}>Last 24 hours</Link>
                  <Link onClick={() => handleClickOnLink('d-7')}>Last 7 days</Link>
                  <Link onClick={() => handleClickOnLink('d-30')}>Last 30 days</Link>
                  <Link onClick={() => handleClickOnLink('d-90')}>Last 90 days</Link>
                  <Link onClick={() => handleClickOnLink('y-1')}>Last 1 year</Link>
                </Stack>
              </Stack>
              <Separator></Separator>
            </Stack>
          </Callout>
        )}
      </Stack>
    </>
  );
};

export default CalloutDate;
