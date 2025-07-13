'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlayCircle,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  Repeat,
  Terminal,
  BrainCircuit,
  FileJson,
  History,
  PenLine,
  Video,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { runAutomationLoop, type IterationResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  prompt: z.string().min(10, 'El prompt debe tener al menos 10 caracteres.'),
  maxIterations: z.coerce.number().int().min(1, 'Debe ser al menos 1.').max(10, 'No puede exceder 10.'),
});

export function CreatorTube() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<IterationResult[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: 'Un video corto sobre los beneficios de la meditación',
      maxIterations: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults([]);
    setFinalVideoUrl(null);
    try {
      const finalResults = await runAutomationLoop(values.prompt, values.maxIterations);
      setResults(finalResults);
      
      const lastResult = finalResults[finalResults.length - 1];
      if (lastResult && lastResult.results.videoUrl) {
        setFinalVideoUrl(lastResult.results.videoUrl);
        toast({
            title: '¡Video Generado!',
            description: 'La automatización se completó y tu video está listo.',
        });
      } else {
        toast({
          title: 'Automatización Completa',
          description: `El ciclo de automatización finalizó después de ${finalResults.length} iteración(es).`,
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ocurrió un error',
        description: error instanceof Error ? error.message : 'No se pudo ejecutar el ciclo de automatización.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusIcon = (result: IterationResult, index: number, total: number) => {
    const isLast = index === total - 1;
    if (isLast) {
      if (!result.results.shouldRerun) {
        return <CheckCircle2 className="h-6 w-6 text-green-500" />; // Finished successfully
      }
      return <XCircle className="h-6 w-6 text-destructive" />; // Max iterations reached
    }
    return <Repeat className="h-6 w-6 text-blue-500" />; // Rerunning
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal />
                Configuración de Automatización de Colab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><PenLine className="h-4 w-4" /> Escribe tu idea para el video</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Ej: "Un video sobre cómo hacer un pastel de chocolate"'
                        className="min-h-[120px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe la idea principal para tu video. La IA generará y refinará el contenido.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxIterations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Iteraciones</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" className="max-w-[120px]" {...field} />
                    </FormControl>
                     <FormDescription>
                      El número máximo de veces que la IA refinará el contenido.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Iniciar Automatización
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {finalVideoUrl && (
        <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Video />
                Video Generado
            </h2>
            <Card>
                <CardContent className="p-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-secondary">
                         <video src={finalVideoUrl} controls className="h-full w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                        <a href={finalVideoUrl} download>
                            <Download className="mr-2 h-4 w-4"/>
                            Descargar Video
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </section>
      )}

      {(isLoading || results.length > 0) && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <History />
            Registro de Automatización
          </h2>
          {isLoading && results.length === 0 && (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">Automatización en progreso...</p>
              <p className="text-muted-foreground">La IA está analizando los resultados y decidiendo los siguientes pasos.</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="relative space-y-8 pl-8">
              <div className="absolute left-4 top-4 h-full w-0.5 bg-border" />
              {results.map((result, index) => (
                <div key={result.iteration} className="relative">
                  <div className="absolute -left-8 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background">
                    {getStatusIcon(result, index, results.length)}
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Iteración {result.iteration}</span>
                        {index === results.length - 1 && !result.results.shouldRerun && <span className="text-sm font-medium text-green-500">Completado</span>}
                        {index === results.length - 1 && result.results.shouldRerun && <span className="text-sm font-medium text-destructive">Detenido (Máx. Iteraciones)</span>}
                        {index < results.length - 1 && <span className="text-sm font-medium text-blue-500">Re-ejecutando...</span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold"><FileJson className="h-4 w-4 text-muted-foreground"/>Parámetros Usados</h4>
                        <pre className="mt-2 rounded-md bg-secondary p-4 text-sm text-secondary-foreground overflow-x-auto"><code>{JSON.stringify(JSON.parse(result.parameters), null, 2)}</code></pre>
                      </div>
                       <div>
                        <h4 className="flex items-center gap-2 font-semibold"><BrainCircuit className="h-4 w-4 text-muted-foreground"/>Decisión de la IA</h4>
                        <p className="mt-2 rounded-md border bg-card p-3 text-sm italic">"{result.results.reason}"</p>
                      </div>
                      {result.results.shouldRerun && result.results.newParameters && index < results.length-1 && (
                         <div>
                           <h4 className="flex items-center gap-2 font-semibold"><FileJson className="h-4 w-4 text-muted-foreground"/>Nuevos Parámetros para la Siguiente Iteración</h4>
                           <pre className="mt-2 rounded-md bg-secondary p-4 text-sm text-secondary-foreground overflow-x-auto"><code>{JSON.stringify(JSON.parse(result.results.newParameters), null, 2)}</code></pre>
                         </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
