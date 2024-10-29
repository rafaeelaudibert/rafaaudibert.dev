import React from 'react';
import { Container, Row, Column } from 'components/common';
import dev from 'assets/illustrations/skills.svg';
import { Skill } from 'components/landing/Skill';
import skills from 'data/skills.json';
import { Wrapper, SkillsWrapper, Details, Thumbnail } from './styles';

export const Skills = () => {

  const evenSkills = [...skills].filter((_skill, idx) => idx % 2 === 0)
  const oddSkills = [...skills].filter((_skill, idx) => idx % 2 === 1)
  
  return (
    <Wrapper id="skills">
      <SkillsWrapper as={Container}>
        <Thumbnail>
          <img src={dev} alt="I’m Rafa and I’m a Backend engineer!" />
        </Thumbnail>
        <Details>
          <h1>My hard skills</h1>
          <Row as={Container}>
            <Column as={Container}>
              {evenSkills.map(({ name, icon, color, level, percentage }) => (
                <Skill key={name} name={name} icon={icon} color={color} level={level} percentage={percentage} />
              ))}
            </Column>
            <Column as={Container}>
              {oddSkills.map(({ name, icon, color, level, percentage }) => (
                <Skill key={name} name={name} icon={icon} color={color} level={level} percentage={percentage} />
              ))}
            </Column>
          </Row>

          <p>
            Few stuff that I've learned through the years, heavily focusing on backend technologies, but with a lot of
            curiosities on new trends (like Dart, Rust, NextJS).
          </p>
        </Details>
      </SkillsWrapper>
    </Wrapper>
  )
};
