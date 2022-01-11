import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';

type Props = {
  itemsCountBySegmentsQuery;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { itemsCountBySegmentsQuery, type, boardId, pipelineId } = props;

  const counts = itemsCountBySegmentsQuery.itemsCountBySegments || [];

  return (
    <Segments
      contentType={type}
      boardId={boardId}
      pipelineId={pipelineId}
      counts={counts}
    />
  );
};

type WrapperProps = {
  type: string;
  boardId: string;
  pipelineId: string;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps>(gql(queries.itemsCountBySegments), {
      name: 'itemsCountBySegmentsQuery',
      options: ({ type, pipelineId, boardId }) => ({
        variables: { type, pipelineId, boardId }
      })
    })
  )(SegmentFilterContainer)
);
