import { DetailsRow, IDetailsRowProps } from '@fluentui/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppInsights } from '../hooks/useAppInsights';
import { useSearch } from '../hooks/useSearch';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';

interface IListSearchResultsItemProps {
  detailsListProps: IDetailsRowProps;
}

const ListSearchResultsItem: React.FunctionComponent<IListSearchResultsItemProps> = (props) => {
  const appInsights = useAppInsights();
  const navigate = useNavigate();
  const [searchContext] = useSearch();
  const [searchIndexParams] = useSearchIndexParams();

  const onClick = (e) => {
    let item = props.detailsListProps.item;
    let rankPagePosition = item.rank;
    let rankPosition = (searchIndexParams.page - 1) * searchIndexParams.size + rankPagePosition;

    appInsights.trackEvent({
      name: 'onNavigate',
      properties: {
        queryId: searchContext.searchId,
        videoId: item.videoId,
        rankPosition: rankPosition,
        rankPagePosition: rankPagePosition,
        page: searchIndexParams.page,
        pageSize: searchIndexParams.size,
      },
    });

    navigate('/videos/' + item.videoId);
  };

  return (
    <div onClick={onClick}>
      <DetailsRow {...props.detailsListProps} styles={{ root: { cursor: 'pointer' } }} />
    </div>
  );
};

export default React.memo(ListSearchResultsItem);
