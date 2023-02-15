import { Checkbox } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { mapFacetName } from '../helpers/stringHelper';
import { Filter } from '../types';

interface IListSearchFacetProps {
  name: string;
  value: { value: string; count: number };
  addFilter: (filter: Filter) => void;
  removeFilter: (filter: Filter) => void;
  selectedFacets: Filter[];
}

const ListSearchFacet: React.FunctionComponent<IListSearchFacetProps> = (props) => {
  let [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const s = props.selectedFacets.some((facet) => facet.value === props.value.value);
    setIsSelected(s);
  }, [props.selectedFacets, props.value.value]);

  const onChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, isChecked?: boolean) => {
    if (isChecked) {
      props.addFilter({ field: props.name, value: props.value.value });
    } else {
      props.removeFilter({ field: props.name, value: props.value.value });
    }
  };

  return (
    <>
      <Checkbox label={mapFacetName(props.value.value) + ' (' + props.value.count + ')'} onChange={onChange} checked={isSelected} />
    </>
  );
};

export default ListSearchFacet;
