import React from 'react';
import _ from 'lodash';

import { 
  Card, 
  CardTitle, 
  CardBody, 
  CardFooter,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell, } from '@patternfly/react-core';

function ObjectAsCard({ obj, parentName = 'Response' }) {
  if (_.isArray(obj) && obj.length > 0){
    console.debug('root element is an array');
    obj.map(i => {
      return (<ObjectAsCard obj={i} parentName='' />)
    });
  }
  else if (_.isPlainObject(obj) && !_.isEmpty(obj)) {
    console.debug('current pro is an obj', obj);
    return (
      <Card>
        <CardTitle>{parentName}</CardTitle>
        <CardBody>
          <DataList isCompact>
          {
            _.map( obj, (v, k, o) => {
              console.debug('k, v', k, v);
              if (_.isObjectLike(v)) {
                console.debug('child is an obj ', v);
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
                        <DataListCell key={v}>{v}</DataListCell>
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