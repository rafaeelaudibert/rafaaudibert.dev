import React from 'react';
import { Container, Row, Column } from 'components/common';
import dev from 'assets/illustrations/skills.svg';
import { Skill } from 'components/landing/Skill';
import skills from 'data/skills.json';
import { Wrapper, SkillsWrapper, Details, Thumbnail } from './styles';

export const Skills = () => (
  <Wrapper id="skills">
    <SkillsWrapper as={Container}>
      <Thumbnail>
        <img src={dev} alt="I’m Rafa and I’m a Backend engineer!" />
      </Thumbnail>
      <Details>
        <h1>My hard skills</h1>
        <Row as={Container}>
          <Column as={Container}>
            {[...skills].splice(0, (skills.length + 1) / 2).map(({ id, name, icon, color, level, percentage }) => (
              <Skill key={id} name={name} icon={icon} color={color} level={level} percentage={percentage} />
            ))}
          </Column>
          <Column as={Container}>
            {[...skills].splice((skills.length + 1) / 2).map(({ id, name, icon, color, level, percentage }) => (
              <Skill key={id} name={name} icon={icon} color={color} level={level} percentage={percentage} />
            ))}
          </Column>
        </Row>

        <p>
          Few stuff that I've learned through the years, heavily focusing on backend technologies, but with a lot of
          curiosities on new trends (like React and Dart).
        </p>
      </Details>
    </SkillsWrapper>
  </Wrapper>
);
