import React from "react";
import { TextInput, TextInputProps } from "react-native";
export function Input(props: TextInputProps & { className?: string }) { return <TextInput {...props} />; }
