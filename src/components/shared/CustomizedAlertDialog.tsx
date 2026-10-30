import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomizedButton } from "@/components/shared/CustomizedButton";

type CustomizedAlertDialogProps = {
  trigger: ReactNode;
  title: string;
  message: string;
  submitText?: string;
  cancelText?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
};

export function CustomizedAlertDialog({
  trigger,
  title,
  message,
  submitText = "Usuń",
  cancelText = "Anuluj",
  onSubmit,
  onCancel,
}: CustomizedAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!onSubmit) {
      setOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col border-foreground/10 bg-background text-foreground">
        <AlertDialogHeader className="flex min-h-0 flex-1 flex-col">
          <AlertDialogTitle className="shrink-0 text-2xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="min-h-0 flex-1 overflow-y-auto break-words py-4 text-lg text-foreground/70 [overflow-wrap:anywhere]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex shrink-0 flex-row justify-center">
          <CustomizedButton
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-32 px-6"
          >
            {cancelText}
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-32 rounded-4xl px-6"
          >
            {submitText}
          </CustomizedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
