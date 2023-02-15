import { DefaultButton, mergeStyleSets, Stack, useTheme as useFluentTheme } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
interface ICollapsibleProps {
  label?: string;
  isOpen?: boolean;
}

const classNames = mergeStyleSets({
  collapsible: {
    width: '100%',
  },
  button: {
    heigth: '100%',
    width: '100%',
    border: '0px solid #afafaf',
  },
  parent: {
    border: 'none',
    width: 'calc(100% - 2px) !important',
    overflow: 'hidden',
    transition: 'height 0.3s ease-in-out',
    height: 'auto;',
  },
  content: {
    padding: '0.5rem',
    borderRadius: '0px',
    marginBottom: '0.5rem',
  },
  svg: {
    transform: 'rotate(180deg) translateY(2px)',
    transition: '.35s ease-in-out',
  },
  svgOpen: {
    transform: 'rotate(0deg) translateY(2px)',
    transition: '.3s ease-in-out',
  },
});

const Collapsible: React.FunctionComponent<ICollapsibleProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
  const parentRef = useRef<HTMLDivElement>();
  const svgRef = useRef<HTMLDivElement>();
  const fluentTheme = useFluentTheme();

  // on load, see if we need to close the collapsible, coming from props
  useEffect(() => {
    if (!props.isOpen) {
      parentRef.current.style.height = 0 + 'px';
    }
  }, [props.isOpen]);

  const collapseSection = (useTransition: boolean) => {
    if (!useTransition) {
      parentRef.current.style.height = 0 + 'px';
      return;
    }
    // get the height of the element's inner content, regardless of its actual size
    var sectionHeight = parentRef.current.scrollHeight;

    // temporarily disable all css transitions
    var elementTransition = parentRef.current.style.transition;
    parentRef.current.style.transition = '';

    // on the next frame (as soon as the previous style change has taken effect),
    // explicitly set the element's height to its current pixel height, so we
    // aren't transitioning out of 'auto'
    requestAnimationFrame(() => {
      parentRef.current.style.height = sectionHeight + 'px';
      parentRef.current.style.transition = elementTransition;
      // on the next frame (as soon as the previous style change has taken effect),
      // have the element transition to height: 0
      requestAnimationFrame(() => {
        parentRef.current.style.height = 0 + 'px';
      });
    });
  };

  const eventTransitioned = (event: MessageEvent) => {
    parentRef.current.removeEventListener('transitionend', eventTransitioned);
    // remove "height" from the element's inline styles, so it can return to its initial value
    parentRef.current.style.height = null;
  };

  const expandSection = () => {
    // get the height of the element's inner content, regardless of its actual size
    var sectionHeight = parentRef.current.scrollHeight;

    // have the element transition to the height of its inner content
    parentRef.current.style.height = sectionHeight + 'px';

    // when the next css transition finishes (which should be the one we just triggered)
    parentRef.current.addEventListener('transitionend', eventTransitioned);
  };

  const OpenOrClose = (o: boolean) => {
    setIsOpen(o);
    if (!o) {
      collapseSection(true);
    } else {
      expandSection();
    }
  };

  return (
    <div className={classNames.collapsible}>
      <Stack horizontal verticalAlign="center">
        <DefaultButton data-testid="collapsible-fluentui-defaultbutton" className={classNames.button} onClick={() => OpenOrClose(!isOpen)}>
          {props.label}
        </DefaultButton>
        <div style={{ width: '24px', height: '24px' }} className={isOpen ? classNames.svgOpen : classNames.svg} ref={svgRef}>
          <svg aria-label="caret down icon" viewBox="0 0 24 24" role="img" style={{ fill: fluentTheme.palette.themePrimary }}>
            <path d="m12 15.41-5-5L8.41 9 12 12.58 15.59 9 17 10.41"></path>
          </svg>
        </div>
      </Stack>
      <div className={classNames.parent} ref={parentRef} data-testid="collapsible-inner-div">
        <div className={classNames.content}>{props.children}</div>
      </div>
    </div>
  );
};

export default Collapsible;
