import React from 'react';
import _ from 'lodash';
import { stringifyValue } from './util'

import { 
  Card, 
  CardTitle, 
  CardBody, 
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Gallery,
  GalleryItem, 
} from '@patternfly/react-core';

function DMNResultsAsCards( { decisionResults } ) {
  // console.debug(decisionResults);
  if (_.isArray(decisionResults) && decisionResults.length > 0){
    return (
      <Gallery hasGutter>
        {
          _.map(decisionResults, (v, i) => {// for each decision result
            if (_.isObjectLike(v.result)) {
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{v.decisionName}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                      {
                        _.map( v.result, (v, k, o) => {
                          console.debug('k, v', k, v);
                          return (
                            <DescriptionListGroup>
                              <DescriptionListTerm key={k}>
                                {k}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {stringifyValue(v)}
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
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{v.decisionName}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {stringifyValue(v.result)}
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

export default DMNResultsAsCards;