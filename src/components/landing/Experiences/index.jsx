import React from 'react';
import { Container, Row, Column } from 'components/common';
import dev from 'assets/illustrations/experiences.svg';
import { ExperienceCard } from 'components/landing/ExperienceCard';
import { Wrapper, ExperiencesWrapper, Details, Thumbnail } from './styles';
import experiences from './experiences.json';

export const Experiences = () => (
  <Wrapper id="experiences">
    <ExperiencesWrapper as={Container}>
      <Details>
        <h1>My experiences</h1>
        <Row as={Container}>
          <Column as={Container}>
            {experiences.map(experience => (
              <ExperienceCard {...experience} />
            ))}
          </Column>
        </Row>
      </Details>
      <Thumbnail>
        <img src={dev} alt="I’m Rafa and I’m a Junior Backend engineer!" />
      </Thumbnail>
    </ExperiencesWrapper>
  </Wrapper>
);
