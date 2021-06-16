import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { KubeDeployment, KubeService, IntOrString } from './imports/k8s';

export class AppChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);
    const label = {"app.k8s.io/name": "nginx-app"}

    new KubeService(this, 'svc', {
      spec: {
        type: "ClusterIP",
        ports: [ {
          port: 80,
          targetPort: IntOrString.fromNumber(80)
        } ],
        selector: label
      }
    })
    new KubeDeployment(this, 'app', {
      spec: { 
        replicas: 3,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'nginx',
                image: 'nginx:latest',
                ports: [
                  {
                    containerPort: 80
                  }
                ]
              }
            ]
          }
        }
      
      }
    })
  }
}

const app = new App();
new AppChart(app, 'cdk8s-app', {
  namespace: 'prod'
});
app.synth();
