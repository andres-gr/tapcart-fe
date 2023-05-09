import axios, { AxiosError } from "axios";
import { Button, Container, Input, MantineProvider, Text } from "@mantine/core";
import { IMaskInput } from "react-imask";
import { IMaskInputProps } from "react-imask/dist/mixin";
import { useState } from "react";

import "./App.css";

interface Body {
  number: string;
}

interface Response {
  data: {
    code?: string;
    error?: string;
  };
}

const apiUrl = "https://zigzagfirsthandbetaversion.andres-gr.repl.co";

const numRegex = /^\d{10}$/;

const sleep = () =>
  new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, 2000);
  });

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error("Failed to copy", e);
  }
};

function App() {
  const [isValid, setIsValid] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [num, setNum] = useState("");

  const [error, setError] = useState("");

  const [code, setCode] = useState("");

  const [successCopy, setSuccesCopy] = useState(false);

  const handleInput: IMaskInputProps["onAccept"] = (_, mask) => {
    const value = mask.unmaskedValue;

    if (value.length !== 10) {
      if (isValid) {
        setIsValid(false);
        setNum("");
        setError("");
      }
      return;
    }

    setIsValid(true);
    setNum(value);
  };

  const handleSubmit = async () => {
    if (numRegex.test(num)) {
      setIsSubmitting(true);

      try {
        const { data } = await axios.post<Body, Response>(
          apiUrl,
          {
            number: num,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!data?.error && data?.code) {
          setCode(data.code);
          return;
        }

        throw data.error;
      } catch (e) {
        const err = e as AxiosError<{ error: string }>;
        setError(err.response?.data.error as string);

        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    setError("Invalid Number.");
  };

  const handleCopyCode = async () => {
    if (code) {
      setIsSubmitting(true);

      await copyToClipboard(code);
      setSuccesCopy(true);

      await sleep();

      setIsSubmitting(false);
      setSuccesCopy(false);
    }
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {!code ? (
        <Container miw={500}>
          <Text>HEY KENYON, UNLOCK</Text>
          <Text>30% OFF</Text>
          <Text>YOUR 12TH TRIBE ORDER</Text>

          <Input
            component={IMaskInput}
            error={error}
            inputMode="tel"
            mask="(000)-000-0000"
            placeholder="Tap to enter a phone number"
            radius="xl"
            size="xl"
            mt={16}
            onAccept={handleInput}
          />

          <Text color="red">{error}</Text>

          <Button
            disabled={!isValid || isSubmitting}
            color="yellow"
            radius="xl"
            size="lg"
            mt={16}
            onClick={handleSubmit}
          >
            Submit for 30% off
          </Button>
        </Container>
      ) : (
        <Container miw={500}>
          <Text>HERE IS YOUR DISCOUNT CODE {code}</Text>

          <Button disabled={isSubmitting} mt={16} onClick={handleCopyCode}>
            Copy code to clipboard
          </Button>

          {successCopy && <Text mt={16}>Copied code!</Text>}
        </Container>
      )}
    </MantineProvider>
  );
}

export default App;
