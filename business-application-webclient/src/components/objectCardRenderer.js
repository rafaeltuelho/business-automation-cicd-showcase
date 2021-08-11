import React from 'react';
import _ from 'lodash';
import { stringifyValue } from './util'

import { 
  Card, 
  CardTitle, 
  CardBody, 
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell, 
} from '@patternfly/react-core';

function ObjectAsCard({ obj, parentName = 'Response' }) {
  if (_.isArray(obj) && obj.length > 0){
    console.debug('root element is an array', obj);
    return (
      <Card>
        {
          _.map(obj, (v, i) => {
            return <ObjectAsCard obj={v} parentName='' />;
          })
        }
      </Card>
    );
  }
  else if (_.isObjectLike(obj) && !_.isEmpty(obj)) {
    console.debug('current property is an obj', obj);
    return (
      <Card>
        <CardTitle>{parentName}</CardTitle>
        <CardBody>
          <DataList isCompact>
          {
            _.map( obj, (v, k, o) => {
              // console.debug('k, v', k, v);
              if (_.isObjectLike(v)) {
                // console.debug('child is an obj ', v);
                return <ObjectAsCard obj={v} parentName={k} />;
              }
              return (
                <DataListItem>
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={k}>
                          <span id={k}>{k}</span>
                        </DataListCell>,
                        <DataListCell key={v}>{stringifyValue(v)}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>              
              );
            })
          }
          </DataList>
        </CardBody>
      </Card>
    );
  }
}

export default ObjectAsCard;