import React, {useEffect, useState} from "react";
import {Button, Group, Stack, Textarea} from "@mantine/core";
import {useFetcher} from "react-router";
import {notifications} from "@mantine/notifications";
import {IconCheck} from "@tabler/icons-react";
import type {Document} from "@/models";
import {alertError} from "@/lib/notify";

export default function TextEditor({document}: {document: Document}){
  // const editor = useEditor({
  //   extensions: [
  //     StarterKit,
  //     Underline,
  //     Link,
  //     Highlight,
  //     TextAlign.configure({ types: ['heading', 'paragraph'] }),
  //   ],
  //   content: document.content,
  // });

  const [content, setContent] = useState(document.content)


  const fetcher = useFetcher()

  function handleSaveClick() {
    fetcher.submit({
      action: 'save',
      docId: document.id,
      content: content
    }, { method: "post"})
  }

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        alertError(fetcher.data.error)
        return
      } else {
        notifications.show({
          title: 'Документ сохранен',
          message:'',
          autoClose: 3000,
          color: 'green',
          icon: <IconCheck size={16}/>,
          withCloseButton: false,
            withBorder: true
        })
      }
      // editor!.setHTML(fetcher.data.content)
    }
  }, [fetcher.data])


  return (
      <Stack>


        <Textarea autosize minRows={10}  value={content} onChange={(e) => setContent(e.target.value)}/>

        <Group justify="flex-end">
          <Button loading={fetcher.state != 'idle'} onClick={handleSaveClick}>Сохранить</Button>
        </Group>
      </Stack>
  );
}
