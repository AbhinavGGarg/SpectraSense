import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImagePreviewCardProps {
  imageUrl: string;
  fileName: string;
}

export function ImagePreviewCard({ imageUrl, fileName }: ImagePreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Input</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
          <Image src={imageUrl} alt={fileName} fill className="object-cover" />
        </div>
        <p className="mt-3 truncate text-xs text-slate-300">{fileName}</p>
      </CardContent>
    </Card>
  );
}
