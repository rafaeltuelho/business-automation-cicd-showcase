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

function ObjectAsGallery({ obj, cardTitle = 'Response'}) {
  console.debug('ObjectAsGallery: obj: ', obj);
  if (_.isObjectLike(obj) && !_.isEmpty(obj)) {
    return (
      <Gallery hasGutter>
        <GalleryItem>
          <Card isHoverable >
            <CardTitle>{cardTitle}</CardTitle>
            <CardBody>
              <DescriptionList>
              {
                _.map(obj, (v, k, o) => {// for each object
                  if (_.isObjectLike(v)) {
                    console.debug('nested obj');
                    console.debug('\tv, k, o', k, v);
                    return (<ObjectAsGallery obj={v} cardTitle={k} />)
                  }
                  else {
                    console.debug('not obj: DescriptionListGroup');
                    console.debug('\tv, k, o', k, v);
                    if (k === 'serverEndpointUrl') {
                      return null;
                    }
                    else {
                      return (
                        <DescriptionListGroup>
                          <DescriptionListTerm key={k}>
                            {k}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {stringifyValue(v)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )
                    }
                  }
                })
              }
              </DescriptionList>
            </CardBody>
          </Card>
        </GalleryItem>
      </Gallery>
    );
  }  
}

export default ObjectAsGallery;