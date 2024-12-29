import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

const sampleData: { nodes: Node[]; links: Link[] } = {
  nodes: [
    { id: 'Node 1', group: 1 },
    { id: 'Node 2', group: 1 },
    { id: 'Node 3', group: 2 },
    { id: 'Node 4', group: 2 },
    { id: 'Node 5', group: 3 },
  ],
  links: [
    { source: 'Node 1', target: 'Node 2', value: 1 },
    { source: 'Node 2', target: 'Node 3', value: 1 },
    { source: 'Node 3', target: 'Node 4', value: 1 },
    { source: 'Node 4', target: 'Node 5', value: 1 },
    { source: 'Node 5', target: 'Node 1', value: 1 },
  ],
};

export default function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;

    // Create the simulation
    const simulation = d3
      .forceSimulation(sampleData.nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(sampleData.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody<Node>().strength(-200))
      .force('center', d3.forceCenter<Node>(width / 2, height / 2));

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Create the links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(sampleData.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    // Create the nodes
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(sampleData.nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => d3.schemeCategory10[d.group % 10])
      .call(drag(simulation) as any);

    // Add labels to the nodes
    const labels = svg
      .append('g')
      .selectAll('text')
      .data(sampleData.nodes)
      .join('text')
      .text((d) => d.id)
      .attr('font-size', '12px')
      .attr('dx', 8)
      .attr('dy', 4);

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as Node).x ?? 0)
        .attr('y1', (d) => (d.source as Node).y ?? 0)
        .attr('x2', (d) => (d.target as Node).x ?? 0)
        .attr('y2', (d) => (d.target as Node).y ?? 0);

      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);

      labels.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    });
  }, []);

  function drag(simulation: d3.Simulation<Node, undefined>) {
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag<SVGCircleElement, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Force-Directed Graph
        </h1>
        <div className="bg-card rounded-lg shadow-lg p-4">
          <svg
            ref={svgRef}
            className="w-full border border-border rounded-lg"
          ></svg>
        </div>
      </div>
    </div>
  );
}
