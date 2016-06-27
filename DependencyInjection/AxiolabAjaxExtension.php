<?php

namespace Axiolab\AjaxBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class AxiolabAjaxExtension extends Extension implements PrependExtensionInterface
{
    public function prepend(ContainerBuilder $container)
    {
        $configs = $container->getExtensionConfig($this->getAlias());
        $config = $this->processConfiguration(new Configuration(), $configs);
        $loader = new YamlFileLoader(
            $container,
            new FileLocator(__DIR__.'/../Resources/config')
        );
        $loader->load('services.yml');

        $bundleParameters = [];
        foreach ($config as $node => $value) {
            $bundleParameters[$node] = $value;
        }
        $container->setParameter('axiolab_ajax', $bundleParameters);
        $bundles = $container->getParameter('kernel.bundles');
        //prepend assetic
        if (true === isset($bundles['AsseticBundle'])) {
            $this->configureAssetic($container);
        }
    }

    public function getAlias()
    {
        return 'axiolab_ajax';
    }

    protected function configureAssetic(ContainerBuilder $container)
    {
        $jsPath = '%kernel.root_dir%/../vendor/axiolab/bs-select-bundle/Resources/public/js';
        $cssPath = '%kernel.root_dir%/../vendor/axiolab/bs-select-bundle/Resources/public/css';

        $jsConfig = [
            'axiolab_ajax' => [
                'inputs' => [
                    $jsPath.'/libs/jquery-form.min.js',
                    $jsPath.'/libs/toastr.min.js',
                    $jsPath.'/AjaxResponse.js',
                    $jsPath.'/CriteriaTable.js',
                ],
                'output' => 'js/axiolabajax.js',
            ],
        ];

        $cssConfig = [
            'axiolab_ajax' => [
                'inputs' => [
                    $cssPath.'/toastr.min.css',
                ],
                'output' => 'css/axiolabajax.css',
            ],
        ];
        foreach ($container->getExtensions() as $name => $extension) {
            switch ($name) {
                case 'assetic':
                    $container->prependExtensionConfig(
                        $name,
                        ['assets' => ['javascripts' => $jsConfig, 'stylesheets' => $cssConfig]]
                    );
                    break;
                default:
                    break;
            }
        }
    }

    public function load(array $configs, ContainerBuilder $container)
    {
    }
}
