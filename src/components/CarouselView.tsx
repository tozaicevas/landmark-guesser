import React, {useEffect, useState} from 'react';
import {View, Image, LoaderScreen, Colors, Button} from 'react-native-ui-lib';
import {ImageStyle, StyleSheet, Linking} from 'react-native';
import Layout from '../constants/Layout';
import {WRONG_CHOICES_AMOUNT, Landmark, Country} from '../constants/Game';
import {getRandomInt} from '../utils';
import {generateChoices} from '../utils/Country';
import {getCorrectChoiceTestId, getWrongChoiceTestId} from '../testIds';
import {GALAXY_A5_HEIGHT, NEXUS_5_HEIGHT} from '../utils/responsive';

const getResponsiveVerticalSize = ({
  min,
  max,
  breakpoint,
}: {
  min: number;
  max: number;
  breakpoint: number;
}) =>
  min +
  Math.max(0, Layout.height - breakpoint) *
    ((max - min) / Math.max(1, Layout.height - breakpoint));

const getChoices = (correctAnswer: Country) => {
  const choices = generateChoices(WRONG_CHOICES_AMOUNT, correctAnswer);
  choices.splice(getRandomInt(WRONG_CHOICES_AMOUNT + 1), 0, correctAnswer);
  return choices;
};

const CarouselView = React.memo(
  ({
    landmark,
    isLoading,
    onCorrectAnswer,
    onWrongAnswer,
    testID,
  }: CarouselViewProps) => {
    const {imageUrl: imgUrl, country: correctAnswer} = landmark;

    const [hasChosen, setHasChosen] = useState(false);
    const [hasChosenCorrectAnswer, setHasChosenCorrectAnswer] = useState(false);
    const [choices, setChoices] = useState(getChoices(correctAnswer));
    const [userChoice, setUserChoice] = useState<Country | null>(null);

    useEffect(() => {
      setChoices(getChoices(correctAnswer));
    }, [correctAnswer]);

    const openAuthorLink = () => {
      // @TODO: implement error toast
      Linking.openURL(
        `${
          landmark.authorUrl as string
        }?utm_source=where-is-this&utm_medium=referral`,
      ).catch(() => console.log('Cant open author link'));
    };

    if (isLoading)
      return (
        <View center paddingT-20>
          <View style={styles.place}>
            <LoaderScreen
              testID={`${testID}_LOADER`}
              color={Colors.red10}
              message="Loading..."
            />
          </View>
        </View>
      );

    const getDisabledBackgroundColor = (answer: Country) => {
      if (!hasChosen) return undefined;
      if (hasChosenCorrectAnswer && answer !== correctAnswer) return undefined;
      if (hasChosenCorrectAnswer && answer === correctAnswer)
        return Colors.green30;
      if (!hasChosenCorrectAnswer && answer === userChoice) return Colors.red30;
      if (!hasChosenCorrectAnswer && answer === correctAnswer)
        return Colors.green30;
    };

    const choiceButtonTextSize = Math.round(
      90 - (Layout.height - NEXUS_5_HEIGHT) * 0.0657,
    );
    const choiceButtonTextProp = `text${choiceButtonTextSize}`;

    const choiceButtonMarginBSize = Math.round(
      15 + (Layout.height - NEXUS_5_HEIGHT) * 0.05,
    );
    const choiceButtonMarginBProp = `marginB-${choiceButtonMarginBSize}`;

    const authorMarginTop = getResponsiveVerticalSize({
      min: 5,
      max: 10,
      breakpoint: GALAXY_A5_HEIGHT,
    });
    const authorMarginTopProp = `marginT-${authorMarginTop}`;

    const buttonsMarginTop = getResponsiveVerticalSize({
      min: 10,
      max: 30,
      breakpoint: GALAXY_A5_HEIGHT,
    });
    const buttonsMarginTopProp = `marginT-${buttonsMarginTop}`;

    return (
      <View paddingT-10>
        <View center>
          <Image
            style={styles.place}
            source={{
              uri: imgUrl,
            }}
          />
        </View>
        <View center>
          <Button
            link
            text90
            label={`Author: ${landmark.authorName} (Unsplash)`}
            {...{[authorMarginTopProp]: true}}
            onPress={openAuthorLink}
          />
        </View>
        <View {...{[buttonsMarginTopProp]: true}} paddingH-60>
          {choices.map((answer, index) => (
            <Button
              {...colorProps[index]}
              {...{[choiceButtonTextProp]: true}}
              label={answer}
              key={answer}
              {...{[choiceButtonMarginBProp]: true}}
              disabled={hasChosen}
              disabledBackgroundColor={getDisabledBackgroundColor(answer)}
              onPress={
                answer === correctAnswer
                  ? () => {
                      onCorrectAnswer(landmark);
                      setHasChosenCorrectAnswer(true);
                      setUserChoice(answer);
                      setHasChosen(true);
                    }
                  : () => {
                      onWrongAnswer(landmark, answer);
                      setHasChosenCorrectAnswer(false);
                      setUserChoice(answer);
                      setHasChosen(true);
                    }
              }
              testID={
                answer === correctAnswer
                  ? getCorrectChoiceTestId(testID)
                  : getWrongChoiceTestId(testID, index)
              }
            />
          ))}
        </View>
      </View>
    );
  },
);

const colorKeys = ['bg-orange30', 'bg-blue30', 'bg-yellow30', 'bg-dark30'];
const colorProps = colorKeys.map((colorKey) => ({[colorKey]: true}));

interface CarouselViewProps {
  landmark: Landmark;
  isLoading: boolean;
  onCorrectAnswer: (landmark: Landmark) => void;
  onWrongAnswer: (landmark: Landmark, choice: Country) => void;
  testID: string;
}

interface Styles {
  place: ImageStyle;
}

const styles = StyleSheet.create<Styles>({
  place: {
    width: Layout.width * 0.8,
    height: Layout.height * 0.38,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default CarouselView;
