"use client";

import { useState, type MutableRefObject } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { IPTypeFields, type MetadataField } from "../ip-type-fields.js";
import { IP_TYPES, type IPType } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";

export function IpTypeSection({
  ipType, onIpTypeChange, fieldsRef, uploadDocument, existingDocument,
}: {
  ipType: IPType;
  onIpTypeChange: (type: IPType) => void;
  fieldsRef: MutableRefObject<MetadataField[]>;
  uploadDocument: (file: File) => Promise<string>;
  existingDocument: { uri: string; name: string } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <button type="button" className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">IP Type &amp; Metadata</span>
              <span className="text-xs text-muted-foreground font-normal">Optional</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">IP Type</label>
              <Select value={ipType} onValueChange={(v) => onIpTypeChange(v as IPType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <IPTypeFields
              ipType={ipType}
              onChange={(fields) => { fieldsRef.current = fields; }}
              uploadDocument={uploadDocument}
              existingDocument={existingDocument}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
