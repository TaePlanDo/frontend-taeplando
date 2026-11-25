import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PlanNameEditorProps = {
  name: string;
  disabled: boolean;
  onSave: (name: string) => Promise<void>;
};

export function PlanNameEditor({
  name,
  disabled,
  onSave,
}: PlanNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [invalid, setInvalid] = useState(false);
  const finishing = useRef(false);

  function startEditing() {
    if (disabled) return;
    setValue(name);
    setInvalid(false);
    finishing.current = false;
    setEditing(true);
  }

  function finishEditing() {
    if (finishing.current || disabled) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setInvalid(true);
      return;
    }
    finishing.current = true;
    setEditing(false);
    if (trimmed !== name) void onSave(trimmed);
  }

  return (
    <div className="min-w-0 max-w-full">
      {editing ? (
        <div>
          <Input
            aria-label="Nazwa planu"
            aria-invalid={invalid}
            aria-describedby={invalid ? "plan-name-error" : undefined}
            autoFocus
            maxLength={100}
            value={value}
            disabled={disabled}
            onChange={(event) => {
              setValue(event.target.value);
              setInvalid(false);
            }}
            onBlur={finishEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                finishEditing();
              } else if (event.key === "Escape") {
                event.preventDefault();
                finishing.current = true;
                setEditing(false);
              }
            }}
            className="h-auto min-w-0 text-2xl font-bold text-primary md:text-2xl"
          />
          {invalid ? (
            <p
              id="plan-name-error"
              role="alert"
              className="mt-1 text-sm text-destructive"
            >
              Nazwa planu nie może być pusta.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 max-w-[30ch] text-2xl font-bold text-primary">
            <button
              type="button"
              disabled={disabled}
              onClick={startEditing}
              className="cursor-pointer text-left [overflow-wrap:anywhere] disabled:cursor-not-allowed"
            >
              {name}
            </button>
          </h1>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Edytuj nazwę planu"
            disabled={disabled}
            onClick={startEditing}
          >
            <Pencil aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
