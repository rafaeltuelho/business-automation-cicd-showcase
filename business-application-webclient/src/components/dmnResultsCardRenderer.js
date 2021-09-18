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

export function DMNResultsRenderer( { decisionResults } ) {
  // console.debug(decisionResults);
  if (_.isArray(decisionResults) && decisionResults.length > 0){
    return (
      <Gallery hasGutter>
        {
          _.map(decisionResults, (r, i) => {// for each decision result
            if (_.isObjectLike(r.result)) {
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{r.decisionName}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                      {
                        _.map( r.result, (v, k, o) => {
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
                    <CardTitle>{r.decisionName}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {stringifyValue(r.result)}
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

export function DroolsResultsRenderer( { decisionResults } ) {
  // console.debug(decisionResults);
  if (_.isArray(decisionResults) && decisionResults.length > 0){
    return (
      <Gallery hasGutter>
        {
          _.map(decisionResults, (r, i) => {// for each decision result
            if (_.isObjectLike(r.value)) {
              const nestedObject = Object.entries(r.value)[0][1];
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{r.key}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                      {
                        _.map( nestedObject, (v, k, o) => {
                          // console.debug('k, v', k, v);
                          //TODO: still need to handle nested objects...
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
                    <CardTitle>{r.key}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {stringifyValue(r.value)}
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

function RenderInnerBody( { innerObj } ) {
  console.debug('RenderInnerBody obj ', innerObj);
  return(
    <>
    {
      _.map( innerObj, (v, k, o) => {
        // console.debug('RenderInnerBody k, v ', k, v);
        if (_.isObjectLike(v)) {
          // console.debug('RenderInnerBody _.isObjectLike(v) ', v);
          return (<RenderInnerBody innerObj={v} />);
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
          );
        }
      })
    }
    </>
  )
}

export function KogitoDroolsResultsRenderer( { decisionResults } ) {
  // console.debug(decisionResults);
  if (_.isArray(decisionResults) && decisionResults.length > 0){
    return (
      <Gallery hasGutter>
        {
          _.map(decisionResults, (r, i) => {// for each decision result
            if (_.isObjectLike(r)) {
              return (
                <GalleryItem>
                  <Card isHoverable>
                    <CardTitle>{i}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <RenderInnerBody innerObj={r}/>
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
                    <CardTitle>{i}</CardTitle>
                    <CardBody>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListDescription>
                            {stringifyValue(r)}
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

export default { DMNResultsRenderer, DroolsResultsRenderer, KogitoDroolsResultsRenderer };