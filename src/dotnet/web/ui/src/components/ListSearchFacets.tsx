import { Stack } from '@fluentui/react';
import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { mapFacetName } from '../helpers/stringHelper';
import { Filter } from '../types';
import Collapsible from './Collapsible';
import ListSearchFacet from './ListSearchFacet';

interface IListSearchFacetsProps {
  apiAccessToken: string;
  facets: any[];
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
}

const ListSearchFacets: React.FunctionComponent<IListSearchFacetsProps> = (props) => {
  const addFilter = (filter: Filter) => {
    const newFilters = props.filters.concat(filter);
    props.setFilters(newFilters);
  };

  const removeFilter = (filter: Filter) => {
    const newFilters = props.filters.filter((item) => item.value !== filter.value);
    props.setFilters(newFilters);
  };

  return (
    <>
      {props.facets &&
        props.facets.map((facet, index) => (
          <Stack tokens={{ childrenGap: 10 }} key={index}>
            <Collapsible label={mapFacetName(facet.name)} isOpen={true}>
              <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                {facet &&
                  facet.values &&
                  facet.values.map((val, index2) => (
                    <ListSearchFacet
                      key={index + '-' + index2}
                      value={val}
                      addFilter={addFilter}
                      removeFilter={removeFilter}
                      selectedFacets={props.filters.filter((f) => f.field === facet.name)}
                      name={facet.name}
                    />
                  ))}
              </Stack>
            </Collapsible>
          </Stack>
        ))}
    </>
  );
};

export default ListSearchFacets;
