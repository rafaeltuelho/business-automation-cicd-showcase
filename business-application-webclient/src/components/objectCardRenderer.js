import React from 'react';
import _ from 'lodash';
import { stringifyValue } from './util'

import { 
  Card, 
  CardTitle, 
  CardBody, 
  Gallery,
  GalleryItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription, 
} from '@patternfly/react-core';

function ObjectAsCard({ obj }) {
  console.debug('ObjectAsCard: obj: ', obj);
  if (_.isArray(obj) && obj.length > 0){
    console.debug('is array: ', obj.length);
    return (
      <Card>
        {
          _.map(obj, (v, i) => {
            return <ObjectAsCard obj={v} />;
          })
        }
      </Card>
    );
  }
  else if (_.isObjectLike(obj) && !_.isEmpty(obj)) {
    return (
      <Gallery hasGutter>
        {
          _.map(obj, (v, k, o) => {// for each object
            if (_.isObjectLike(v)) {
              console.debug('is obj');
              console.debug('v, k, o', k, v);
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{k}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                      {
                        _.map( v, (ov, ok, oo) => {
                          console.debug('ok, ov, oo', ok, ov);
                          return (
                            <DescriptionListGroup>
                              <DescriptionListTerm key={ok}>
                                {ok}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {stringifyValue(ov)}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          );
                        })                      
                      }
                      </DescriptionList>
                    </CardBody>
                  </Card>
                </GalleryItem>
              )
            }
            else {
              console.debug('not obj');
              console.debug('v, k, o', k, v);
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{k}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {stringifyValue(v)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>
                  </Card>
                </GalleryItem>
              )
            }
          })
        }
      </Gallery>
    );
  }  
}

export default ObjectAsCard;