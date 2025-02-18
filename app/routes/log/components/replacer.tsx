import React, {type JSX} from 'react';
import {Link} from "react-router";

// Define interfaces for expected data structures
interface PlaceholderData {
  type: string;
  id: any;
  label: string;
}

const ActionComponent: React.FC<{ data: PlaceholderData }> = ({ data }) => {

  const colors = {
    ADD: '#3276ff',
    CONFIRM: 'green',
    CANCEL: 'red',
    CONFIRM_CANCEL: '#555555'
  } as any

  return <span style={{color:colors[data.id]}}>{data.label}</span>
}

const BookingComponent: React.FC<{ data: PlaceholderData }> = ({ data }) => (
    <span>№{data.id}</span>
);

const ScheduleComponent: React.FC<{ data: PlaceholderData }> = ({ data }) => (
    <span>{data.label}</span>
);

const OfficeComponent: React.FC<{ data: PlaceholderData }> = ({ data }) => (
    <span>{data.label}</span>
);

const ClientComponent: React.FC<{ data: PlaceholderData }> = ({ data }) => (
    <Link style={{textDecoration:'underline'}} to={'/clients?id='+data.id}>{data.label}</Link>
);

// Map types to corresponding components
const componentMap: { [key: string]: React.FC<{ data: PlaceholderData }> } = {
  action: ActionComponent,
  booking: BookingComponent,
  schedule: ScheduleComponent,
  office: OfficeComponent,
  client: ClientComponent,
};

export function parseAndReplace(input: string): (string | JSX.Element)[] {
  const regex = /{{{([^{}]*)}}}/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  input.replace(regex, (match, jsonString, offset) => {

    jsonString = `{${jsonString}}`;
    // Add text before the current match
    if (lastIndex < offset) {
      parts.push(input.slice(lastIndex, offset));
    }

    try {
      const data: PlaceholderData = JSON.parse(jsonString);
      const Component = componentMap[data.type];
      if (Component) {
        parts.push(<Component key={offset} data={data} />);
      } else {
        // If no matching component, keep the original placeholder
        parts.push(match);
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      // In case of parsing error, keep the original placeholder
      parts.push(match);
    }

    lastIndex = offset + match.length;
    return ''; // Return value is ignored
  });

  // Add remaining text after the last match
  if (lastIndex < input.length) {
    parts.push(input.slice(lastIndex));
  }

  return parts;
}

