import * as React from "react";
import {Flex, Spinner, Text} from "@chakra-ui/react";

export default function SpinnerWithMessage(props: {message: string}) {
  return (
    <Flex direction="column" align="center">
      <Spinner color="#0094FF" size="xl" thickness="0.25rem" />
      <Text mt="1rem" color="#004e87" fontSize="2rem">{props.message}</Text>
    </Flex>
  );
};
