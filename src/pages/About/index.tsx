import React from 'react';
import { useTransform, useScroll } from 'framer-motion';
import { useRef } from 'react';
import {
  AnimatedHeading,
  AppContainer,
  ImageContainer,
  MainContainer,
  Section,
} from './index.styles';

const data = [
  {
    id: 1,
    text: 'Canyon',
    url: 'https://images.pexels.com/photos/19561297/pexels-photo-19561297.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  },
  {
    id: 2,
    text: 'Kyoto',
    url: 'https://images.pexels.com/photos/19488566/pexels-photo-19488566/free-photo-of-kyoto.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  },
  {
    id: 3,
    text: 'Forest',
    url: 'https://images.pexels.com/photos/19237996/pexels-photo-19237996/free-photo-of-empty-road-in-forest.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  },
  {
    id: 4,
    text: 'Vietnam',
    url: 'https://images.pexels.com/photos/18707547/pexels-photo-18707547/free-photo-of-a-curved-road-in-the-mountains-with-a-motorcycle.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  },
];

interface ImageProps {
  text: string;
  url: string;
}

const Images: React.FC<ImageProps> = ({ text, url }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [-300, 350]);
  return (
    <Section>
      <ImageContainer ref={ref}>
        <img src={url} alt={text} />
      </ImageContainer>
      <AnimatedHeading style={{ y }}>{text}</AnimatedHeading>
    </Section>
  );
};

const About: React.FC = () => {
  return (
    <MainContainer>
      <AppContainer>
        {data.map((img) => (
          <Images key={img.id} text={img.text} url={img.url} />
        ))}
      </AppContainer>
    </MainContainer>
  );
};

export default About;
