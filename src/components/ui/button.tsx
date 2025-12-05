import React from "react";
import { Pressable, PressableProps, Text } from "react-native";
export function Button({ children, ...rest }: PressableProps & { children?: React.ReactNode; className?: string }) { return (<Pressable {...rest}><Text>{children}</Text></Pressable>); }
