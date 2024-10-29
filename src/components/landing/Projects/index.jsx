import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Container, Card } from 'components/common';
import starIcon from 'assets/icons/star.svg';
import commitIcon from 'assets/icons/commit.svg';
import { Wrapper, Grid, Item, Content, Stats } from './styles';

export const Projects = () => {
  const {
    github: {
      repositoryOwner: {
        itemShowcase: {
          items: { edges },
        },
      },
    },
  } = useStaticQuery(
    graphql`
      {
        github {
          repositoryOwner(login: "rafaeelaudibert") {
            ... on GitHub_ProfileOwner {
              pinnedItemsRemaining
              itemShowcase {
                items(first: 6) {
                  totalCount
                  edges {
                    node {
                      ... on GitHub_Repository {
                        id
                        name
                        url
                        description
                        stargazers {
                          totalCount
                        }
                        forkCount

                        commits: object(expression: "master") {
                          ... on GitHub_Commit {
                            history {
                              totalCount
                            }
                          }
                        }                        
                      }
                    }
                  }
                }
                hasPinnedItems
              }
            }
          }
        }
      }
    `
  );

  return (
    <Wrapper as={Container} id="projects">
      <h2>Projects</h2>
      <Grid>
        {edges.map(({ node }) => (
          <Item key={node.id} as="a" href={node.url} target="_blank" rel="noopener noreferrer">
            <Card>
              <Content>
                <h4>{node.name}</h4>
                <p>{node.description}</p>
              </Content>
              <Stats>
                <div>
                  <img src={starIcon} alt="stars" />
                  <span>{node.stargazers.totalCount}</span>
                </div>
                <div>
                  <img src={commitIcon} alt="commits" />
                  <span>{node.commits.history.totalCount}</span>
                </div>
              </Stats>
            </Card>
          </Item>
        ))}
      </Grid>
    </Wrapper>
  );
};
